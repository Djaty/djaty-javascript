// generated on 2016-07-11 using generator-webapp 2.1.0
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const concat = require('gulp-concat');
const closure = require('gulp-jsclosure');
const wrap = require('gulp-wrap-umd');
// const debug = require('gulp-debug');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('prepare:libsWrapper', cb => {
  const baseDir = './web/scripts';
  let wrapper = fs.readFileSync(`${baseDir}/libWrapper.js`, 'utf8');

  // Using match() won't return captured groups if the global modifier is set.
  // So use test() or exec() instead.
  const pattern = /path: '(.*)'/g;
  let match = null;

  let replacement = '';
  match = pattern.exec(wrapper);
  while (match) {
    const lib = fs.readFileSync(`${baseDir}/${match[1]}`, 'utf8');
    replacement += lib;
    match = pattern.exec(wrapper);
  }

  wrapper = wrapper.replace(/\/\/ =Inject Libs/, replacement);

  // Create scriptsDir recursively if not exists!
  const scriptsDir = '.tmp/scripts';
  scriptsDir.split('/').forEach((dir, index, splits) => {
    const parent = splits.slice(0, index).join('/');
    const dirPath = path.resolve(parent, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });

  fs.writeFile('.tmp/scripts/libWrapper.js', wrapper, cb);
});

gulp.task('scripts', ['prepare:libsWrapper'], () => gulp.src(['web/scripts/**/*.js', '!web/scripts/libWrapper.js',
  '.tmp/scripts/libWrapper.js'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({ stream: true })));

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({ stream: true, once: true }))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => lint('web/scripts/**/*.js', { fix: false }).pipe(gulp.dest('web/scripts')));

gulp.task('lint:test', () => lint('test/spec/**/*.js', {
  fix: false,
  env: {
    mocha: true,
  },
})
    .pipe(gulp.dest('test/spec/**/*.js')));

gulp.task('build:jsAgentCoreDjaty', ['scripts'], () => {
  return gulp.src('web/index.html')
    .pipe($.if('*.html', $.useref({
      searchPath: ['.tmp', 'web', '.'],
    })))
    .pipe($.if('*.js', $.sourcemaps.init()))
    .pipe($.if('*.js', $.babel()))
    .pipe($.if('*.js', $.uglify()))
    .pipe(wrap({
      namespace: 'Djaty',
      template: fs.readFileSync('./template.jst', 'utf8'),
    }))
    .pipe($.if('*.js', $.sourcemaps.write('.')))
    // To ignore *.html files
    .pipe($.if(/\.js/, gulp.dest('dist')));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('build', ['lint', 'build:jsAgentCoreDjaty'], () =>
  gulp.src('dist/**/*')
    .pipe($.size({ title: 'build', gzip: true })));

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

gulp.task('serve', ['scripts'], () => {
  console.log('Serving: web/playground.html');
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'web'],
      index: 'playground.html',
      routes: {
        '/bower_components': 'bower_components',
      },
    },
  });

  // gulp.watch([
  //   'web/*.html',
  // ]).on('change', reload);

  gulp.watch('web/scripts/**/*.js', ['scripts']);
  gulp.watch('bower.json', ['wiredep']);
});
