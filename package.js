Package.describe({
  name: 'forwarder:autoform-wizard',
  summary: 'A wizard component for AutoForm.',
  version: '0.3.3',
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
    'amplify@1.0.0'
  ], 'client');
  
  api.use('aldeed:autoform', 'client');
  
  api.addFiles([
    'wizard.html',
    'wizard.js',
    'cache.js'
  ], 'client');
});