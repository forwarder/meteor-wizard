Package.describe({
  name: 'forwarder:autoform-wizard',
  summary: 'A wizard component for AutoForm.',
  version: '0.3.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  
  api.use([
    'underscore',
    'tracker',
    'templating',
    'blaze',
    'session',
    'amplify@1.0.0'
  ], 'client');
  
  api.use('aldeed:autoform@3.0.0', 'client');
  
  api.addFiles([
    'wizard.html',
    'wizard.js',
    'cache.js'
  ], 'client');
});