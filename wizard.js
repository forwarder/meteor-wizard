var wizardsById = {};
var defaultId = '_defaultId';

Template.wizard.innerContext = function(outerContext) {
  var context = this
    , wizard = wizardsById[this.id]
    , activeStep = wizard.activeStep();

  var innerContext = {
    data: activeStep && activeStep.data,
    wizard: wizardsById[this.id]
  }
  
  _.extend(innerContext, outerContext);
  return innerContext;
}

Template.wizard.created = function() {
  var id = this.data.id || defaultId;
  wizardsById[id] = new Wizard(this);
}

Template.wizard.destroyed = function() {
  var id = this.data.id || defaultId;

  if (wizardsById[id]) {
    wizardsById[id].destroy();
    delete wizardsById[id];
  }
}

Template.wizard.activeStepClass = function(id) { 
  var activeStep = this.wizard.activeStep();
  return (activeStep && activeStep.id == id) && 'active' || '';
}

Template.wizard.activeStep = function() {
  var activeStep = this.wizard.activeStep();
  return activeStep && Template[activeStep.template] || null;
}

var Wizard = function(template) {
  this._dep = new Deps.Dependency;
  this.template = template;
  this.id = template.data.id;
  this.route = template.data.route;
  this.steps = template.data.steps;

  this._stepsByIndex = [];
  this._stepsById = {}
  
  this.store = new CacheStore(this.id, {
    persist: template.data.persist !== false,
    expires: template.data.expires || null
  });
  
  this.initialize();
}

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
    
    this._stepsByIndex.push(step.id);
    this._stepsById[step.id] = _.extend(step, {
      wizard: self,
      data: function() {
        return self.store.get(step.id);
      }
    });
    
    AutoForm.addHooks([step.formId], {
      onSubmit: function(data) {
        if(step.onSubmit) {
          step.onSubmit(data, self.mergedData());
        } else {
          self.next(data);
        }
        return false;
      }
    });
  },
  
  _setActiveStep: function() {
    // show the first step if not bound to a route
    if(!this.route) {
      return this.show(0);
    }

    var current = Router.current();
    
    if(!current || (current && current.route.name != this.route)) return false;
    
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
    this.store.set(id, data);
  },
  
  clearData: function() {
    this.store.clear();
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
    
    this.setData(this._activeStepId, data);
    
    this.show(activeIndex + 1);
  },
  
  previous: function() {
    var activeIndex = _.indexOf(this._stepsByIndex, this._activeStepId);

    this.setData(this._activeStepId, AutoForm.getFormValues(this.activeStep(false).formId));
    
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
  
  destroy: function() {
    if(this.clearOnDestroy) this.clearData();
  } 
}