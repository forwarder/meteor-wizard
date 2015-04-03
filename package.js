Package.describe({
  name: 'forwarder:autoform-wizard',
  summary: 'A multi step form component for AutoForm.',
  version: '0.6.1',
  git: 'https://github.com/forwarder/meteor-wizard.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  
  api.use([
    'underscore',
    'tracker',
    'templating',
    'blaze',
    'session',
    'ejson',
    'localstorage'
  ], 'client');
  
  api.use('aldeed:autoform@5.0.0', 'client');
  
  api.addFiles([
    'wizard.html',
    'wizard.js',
    'cache.js'
  ], 'client');
});