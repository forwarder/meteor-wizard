Package.describe({
  name: 'wizard',
  summary: "A wizard component for AutoForm."
});

Package.on_use(function (api) {
  api.use(['underscore', 'deps', 'templating', 'ui', 'session', 'amplify'], 'client');
  api.use('autoform', 'client');
  
  api.add_files([
    'wizard.html',
    'wizard.js',
    'cache.js'
  ], 'client');
});
