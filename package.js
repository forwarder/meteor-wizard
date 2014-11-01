Package.describe({
  name: 'forwarder:autoform-wizard',
  summary: 'A wizard component for AutoForm.',
  version: '0.3.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  
  api.use([
    'underscore',
    'tracker',
    'templating',
    'blaze',
    'session',
    'amplify'
  ], 'client');
  
  api.use('aldeed:autoform', 'client');
  
  api.addFiles([
    'wizard.html',
    'wizard.js',
    'cache.js'
  ], 'client');
});