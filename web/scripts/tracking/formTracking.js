/**
* Tracking Forms.
*
* This file is combined with other tracking files using 'gulp' then the generated
* file will be injected by the extension or manually by including the file.
*/

/* global Event */

const formTracker = {
  localStorage: {},

  /* ###################################################################### */
  /* ########################### PUBLIC METHODS ########################### */
  /* ###################################################################### */

  /** ************************** Initializing Obj ************************* */
  /**
  * Initialization of the tracker.
  *
  * @param  {Object} localStorage: LocalStorage connection.
  * @return void
  */
  init(localStorage) {
    if (!localStorage) {
      throw new Error('formTracker can\'t be initialized without storage');
    }

    this.localStorage = localStorage;
  },

  /**
  * On form submit event handler.
  *
  * @param {Event} ev
  * @param {Number} time
  * @param {Function} cb
  * @return void
  */
  timelineFormatter({ ev, time = Date.now() }, cb) {
    try {
      if (!(Djaty.utils.isInstanceOf('Event', ev) && ev.type === 'submit')) {
        throw new Error('timelineFormatter only accept events of type \'submit\'');
      }

      formTracker._timelineFormatter(ev, time, cb);
    } catch (err) {
      Djaty.logger.warn('Unable to format form', {
        originalItem: {
          itemType: 'form',
          timestamp: time,
        },
      }, err);
      cb({ isIgnored: true });
    }
  },

  _timelineFormatter(ev, time, cb) {
    const inputs = [];
    let isPwdForm = false;
    const inputTypes = ['input', 'textarea', 'select'];

    Djaty.utils.forOwn(ev.target, (key, val) => {
      if (!(Djaty.utils.isDomElement(val) && inputTypes
          .some(type => val.nodeName.toLowerCase() === type) && val.type !== 'submit'
        && !((val.type === 'radio' || val.type === 'checkbox') && !val.checked))) {
        return;
      }

      // Check if form has at least one password field
      isPwdForm = val.type === 'password' && !isPwdForm ? !isPwdForm : isPwdForm;
      let values = null;
      if (val.type === 'select-multiple' || val.type === 'select-one') {
        values = [];
        Djaty.utils.forOwn(val.selectedOptions, (index, option) => {
          values.push({
            text: option.text,
            value: option.value,
          });
        });
      }

      const existingField = inputs.find(input => input.name === val.name);

      if (val.type === 'checkbox') {
        if (existingField && val.checked) {
          if (!Array.isArray(existingField.value)) {
            existingField.value = [existingField.value];
          }

          existingField.value.push(val.value);
          return;
        }

        if (!val.checked) {
          return;
        }
      }

      if (val.type === 'radio') {
        if (existingField) {
          existingField.value = val.checked ? val.value : existingField.value;
          return;
        }
        val.value = val.checked ? val.value : '';
      }

      const inputInfo = {
        type: val.type,
        name: val.name || val.placeholder && val.placeholder.toLowerCase() || val.type,
      };

      if (values) {
        inputInfo.values = values;
      } else {
        inputInfo.value = val.value;
      }

      inputs.push(inputInfo);
    });

    if (!inputs.length) {
      return;
    }

    const formKey = isPwdForm ? 'pwdFormSubmission' : 'lastFormSubmission';
    formTracker.localStorage.set(formKey, {
      inputs,
      url: window.location.href,
      timestamp: time,
    });

    const formattedObj = {
      formInputs: inputs.length,
      formText: `${isPwdForm ? 'Password' : ' Normal'} form is submitted.`,
      url: window.location.href,
      timestamp: time,
    };

    cb({ formattedObj });
  },
};

// Register formTracker component to the parent Djaty tracking app.
Djaty.trackingApp.addTracker('form', formTracker);
