var routers = {}, activeRouter = 'default';

var defaultConfig = {
  go: function(name, stepId) {},
  getParams: function(stepId) {},
  getStep: function() {},
  path: function(name, stepId) {
    return '#' + stepId;
  }
};

Wizard.Router = {
  apply: function(method, args) {
    var router = routers[activeRouter];
    return router[method].apply(router, args);
  },
  go: function() {
    return this.apply('go', arguments);
  },
  getParams: function() {
    return this.apply('getParams', arguments);
  },
  getStep: function() {
    return this.apply('getStep', arguments);
  },
  path: function() {
    return this.apply('path', arguments);
  }
};

Wizard.registerRouter = function wizardRegisterRouter(name, config) {
  if (routers[name]) {
    throw new Meteor.Error('router-configured', 'A router with his name has already been configured.');
  }
  routers[name] = _.defaults(config, defaultConfig);
};

Wizard.useRouter = function wizardUseRouter(name) {
  if (!routers[name]) {
    throw new Meteor.Error('router-not-configured', 'A router with this name hasn\'t been configured.');
  }

  activeRouter = name;
};

Wizard.registerRouter('default', {
  activeStep: new ReactiveVar(),
  go: function(name, stepId) {
    this.activeStep.set(stepId);
  },
  getStep: function() {
    return this.activeStep.get();
  }
});
