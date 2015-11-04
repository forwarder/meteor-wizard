Package.describe({
  name: 'forwarder:autoform-wizard',
  summary: 'A multi step form component for AutoForm.',
  version: '0.9.0',
  git: 'https://github.com/forwarder/meteor-wizard.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use([
    'underscore',
    'tracker',
    'reactive-var',
    'templating',
    'blaze',
    'session',
    'ejson',
    'localstorage'
  ], 'client');

  api.use('aldeed:autoform@5.7.0', 'client');

  api.addFiles([
    'wizard.html',
    'wizard.js',
    'router.js',
    'cache.js'
  ], 'client');

  if (api.export)
    api.export('Wizard', 'client');
});
