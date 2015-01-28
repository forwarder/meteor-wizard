Template.wizard.created = function() {
  this.wizard = new Wizard(this);
};

Template.wizard.destroyed = function() {
  this.wizard && this.wizard.destroy();
};

Template.wizard.helpers({
  innerContext: function(outerContext) {
    var instance = Template.instance()
      , wizard = instance.wizard
      , activeStep = wizard.activeStep();

    var innerContext = {
      data: activeStep && activeStep.data,
      wizard: wizard,
      stepsTemplate: this.stepsTemplate || 'wizardSteps'
    };

    _.extend(innerContext, outerContext);
    return innerContext;
  },
  activeStep: function() {
    var activeStep = this.wizard.activeStep();
    return activeStep && activeStep.template || null;
  }
});

Template.wizardSteps.helpers({
  activeStepClass: function(id) {
    var activeStep = this.wizard.activeStep();
    return (activeStep && activeStep.id == id) && 'active' || '';
  }
});

var Wizard = function(template) {
  this._dep = new Tracker.Dependency();
  this.template = template;
  this.useCache = template.data.useCache !== false;

  _.extend(this, _.pick(template.data, [
    'id', 'route', 'steps', 'clearOnDestroy'
  ]));

  this._stepsByIndex = [];
  this._stepsById = {};

  if (this.useCache) {
    this.store = new CacheStore(this.id, {
      persist: template.data.persist !== false,
      expires: template.data.expires || null
    });
  }

  this.initialize();
};

Wizard.prototype = {

  constructor: Wizard,

  initialize: function() {
    var self = this;

    _.each(this.steps, function(step) {
      self._initStep(step);
    });

    Deps.autorun(function() {
      self._setActiveStep();
    });
  },

  _initStep: function(step) {
    var self = this;

    if(!step.id) {
      throw new Error('Step.id is required');
    }

    if(!step.formId) {
      throw new Error('Step.formId is required');
    }

    (function (template) {
      var useCustom = !self.useCache && _.isFunction(template.data);
      var defaultData = function () { // default data function
        return self.store && self.store.get(step.id);
      };
      var customData = function () { // custom data function
        return template.data(step.id);
      };

      self._stepsByIndex.push(step.id);
      self._stepsById[step.id] = _.defaults(step, {
        wizard: self,
        // use custom data function if not using cache
        data: useCustom ? customData : defaultData
      });
    })(self.template.data);


    AutoForm.addHooks([step.formId], {
      onSubmit: function(data) {
        if(step.onSubmit) {
          step.onSubmit.call(this, data, self, step);
        } else {
          self.next(data);
        }
        return false;
      }
    }, true);
  },

  _setActiveStep: function() {
    // show the first step if not bound to a route
    if(!this.route) {
      return this.show(0);
    }

    var current = Router.current();

    if(!current || (current && current.route.getName() != this.route)) return false;

    var params = current.params
      , index = _.indexOf(this._stepsByIndex, params.step)
      , previousStep = this.getStep(index - 1);

    // initial route or non existing step, redirect to first step
      if(!params.step || index === -1) {
        return this.show(0);
      }

      // invalid step
      if(index > 0 && previousStep && !previousStep.data()) {
        return this.show(0);
      }

      // valid
      this.setStep(params.step);
  },

  setData: function(id, data) {
    this.store && this.store.set(id, data);
  },

  clearData: function() {
    this.store && this.store.clear();
  },

  mergedData: function() {
    var data = {}
    _.each(this._stepsById, function(step) {
      _.extend(data, step.data());
    });
    return data;
  },

  next: function(data) {
    var activeIndex = _.indexOf(this._stepsByIndex, this._activeStepId);

    if (this.useCache) {
      this.setData(this._activeStepId, data);
    }

    this.show(activeIndex + 1);
  },

  previous: function() {
    var activeIndex = _.indexOf(this._stepsByIndex, this._activeStepId);

    if (this.useCache) {
      this.setData(this._activeStepId, AutoForm.getFormValues(this.activeStep(false).formId));
    }

    this.show(activeIndex - 1);
  },

  show: function(id) {
    if(typeof id === 'number') {
      id = id in this._stepsByIndex && this._stepsByIndex[id];
    }

    if(!id) return false;

    if(this.route) {
      Router.go(this.route, {step: id});
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
    this._activeStepId = id;
    this._dep.changed();
    return this._stepsById[this._activeStepId];
  },

  indexOf: function(id) {
    return _.indexOf(this._stepsByIndex, id);
  },

  destroy: function() {
    if(this.useCache && this.clearOnDestroy) this.clearData();
  }
};
