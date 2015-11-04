var wizardsById = {};
var defaultId = '_defaultId';

Template.registerHelper('pathForStep', function(id) {
  if (!this.wizard.forceStepsPath) {
    var activeStep = this.wizard.activeStep(false);
    if (activeStep.id === id || !this.data() || this.wizard.indexOf(id) > this.wizard.indexOf(activeStep.id)) {
      return null;
    }
  } if (!this.wizard.route) {
    return '#' + id;
  }

  return WizardRouter.path(this.wizard.route, id);
});

Template.wizard.created = function() {
  var id = this.data.id || defaultId;
  this.wizard = wizardsById[id] = new Wizard(this.data);
};

Template.wizard.destroyed = function() {
  var id = this.data.id || defaultId;

  if (wizardsById[id]) {
    wizardsById[id].destroy();
    delete wizardsById[id];
  }
};

Template.wizard.helpers({
  innerContext: function(outerContext) {
    var context = this
    , wizard = Template.instance().wizard;

    return _.extend({
      wizard: wizard,
      step: wizard.activeStep(),
    }, outerContext);
  },
  activeStepTemplate: function() {
    var activeStep = this.wizard.activeStep();
    return activeStep && (activeStep.template || this.wizard.stepTemplate) || null;
  }
});

Template.__wizard_steps.events({
  'click a': function(e, tpl) {
    if (!this.wizard.route) {
      e.preventDefault();
      this.wizard.show(this.id);
    }
  }
});

Template.__wizard_steps.helpers({
  activeStepClass: function(id) {
    var activeStep = this.wizard.activeStep();
    return (activeStep && activeStep.id == id) && 'active' || '';
  }
});

Template.wizardButtons.events({
  'click .wizard-back-button': function(e) {
    e.preventDefault();
    this.previous(AutoForm.getFormValues(this.activeStep(false).formId));
  }
});

Template.wizardButtons.helpers({
  showBackButton: function() {
    return this.backButton && !this.isFirstStep();
  }
});

var _options = [
  'id',
  'route',
  'steps',
  'stepsTemplate',
  'stepTemplate',
  'buttonClasses',
  'nextButton',
  'backButton',
  'confirmButton',
  'persist',
  'forceStepsPath',
  'clearOnDestroy'
];

var _defaults = {
  stepsTemplate: '__wizard_steps',
  stepTemplate: '__wizard_step',
  nextButton: 'Next',
  backButton: 'Back',
  confirmButton: 'Confirm',
  persist: true,
  forceStepsPath: false
}

Wizard = function(options) {
  this._dep = new Tracker.Dependency();

  options = _.chain(options).pick(_options).defaults(_defaults).value();
  _.extend(this, options);

  this._stepsByIndex = [];
  this._stepsById = {};

  this.store = new CacheStore(this.id, {
    persist: this.persist !== false
  });

  this.initialize();
};

Wizard.get = function(id) {
  return wizardsById[id || defaultId];
};

Wizard.extendOptions = function(options, defaults) {
  _options = _options.concat(options);
  _.extend(_defaults, defaults);
};

Wizard.prototype = {

  constructor: Wizard,

  initialize: function() {
    var self = this;

    _.each(this.steps, function(step) {
      self._initStep(step);
    });

    this._comp = Tracker.autorun(function() {
      var step;
      if (self.route)
        step = WizardRouter.getStep();

      self._setActiveStep(step);
    });
  },

  _initStep: function(step) {
    var self = this;

    if (!step.id) {
      throw new Meteor.Error('step-id-required', 'Step.id is required');
    }

    if (!step.formId) {
      step.formId = step.id + '-form';
    }

    if (step.data) {
      this.setData(step.id, step.data);
    }

    this._stepsByIndex.push(step.id);
    this._stepsById[step.id] = _.extend(step, {
      wizard: self,
      data: function() {
        return self.store.get(step.id);
      }
    });

    AutoForm.addHooks(step.formId, {
      onSubmit: function(data) {
        this.event.preventDefault();

        if(step.onSubmit) {
          step.onSubmit.call(this, data, self);
        } else {
          self.next(data);
        }
      }
    }, true);
  },

  _setActiveStep: function(step) {
    // show the first step if not bound to a route
    if(!step) {
      return this.setStep(0);
    }

    var index = this.indexOf(step)
      , previousStep = this.getStep(index - 1);

    // initial route or non existing step, redirect to first step
    if(index === -1) {
      return this.setStep(0);
    }

    // invalid step
    if(index > 0 && previousStep && !previousStep.data()) {
      return this.setStep(0);
    }

    // valid
    this.setStep(step);
  },

  setData: function(id, data) {
    this.store.set(id, data);
  },

  clearData: function() {
    this.store.clear();
  },

  mergedData: function() {
    var data = {};
    _.each(this._stepsById, function(step) {
      _.extend(data, step.data());
    });
    return data;
  },

  next: function(data) {
    var activeIndex = _.indexOf(this._stepsByIndex, this._activeStepId);

    if(data) {
      this.setData(this._activeStepId, data);
    }

    this.show(activeIndex + 1);
  },

  previous: function(data) {
    var activeIndex = _.indexOf(this._stepsByIndex, this._activeStepId);

    if(data) {
     this.setData(this._activeStepId, data);
    }

    this.show(activeIndex - 1);
  },

  show: function(id) {
    if(typeof id === 'number') {
      id = id in this._stepsByIndex && this._stepsByIndex[id];
    }

    if(!id) return false;

    if(this.route) {
      WizardRouter.go(this.route, id);
    } else {
      this.setStep(id);
    }

    return true;
  },

  getStep: function(id) {
    if(typeof id === 'number') {
      id = id in this._stepsByIndex && this._stepsByIndex[id];
    }

    return id in this._stepsById && this._stepsById[id];
  },

  activeStep: function(reactive) {
    if(reactive !== false) {
      this._dep.depend();
    }
    return this._stepsById[this._activeStepId];
  },

  setStep: function(id) {
    if(typeof id === 'number') {
      id = id in this._stepsByIndex && this._stepsByIndex[id];
    }

    if(!id) return false;

    this._activeStepId = id;
    this._dep.changed();
    return this._stepsById[this._activeStepId];
  },

  isActiveStep: function(id) {
    return id === this._activeStepId;
  },

  isFirstStep: function(id) {
    id = id || this._activeStepId;
    return this.indexOf(id) === 0;
  },

  isLastStep: function(id) {
    id = id || this._activeStepId;
    return this.indexOf(id) === this._stepsByIndex.length - 1;
  },

  indexOf: function(id) {
    return _.indexOf(this._stepsByIndex, id);
  },

  destroy: function() {
    this._comp.stop();

    if(this.clearOnDestroy) this.clearData();
  }
};
