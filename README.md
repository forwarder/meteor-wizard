meteor-wizard
=============

A wizard component for AutoForm.

## Installation

Install using Meteorite. When in a Meteorite-managed app directory, enter:

```
$ mrt add wizard
```

## Example

First setup your template.

```html
<template name="setupWizard">
  {{> wizard id="setup-wizard" steps=steps}}
</template>

<template name="setupStepOne">
  {{#autoForm schema=schema doc=data id="setup-step-one-form"}}
    
    {{> afQuickField name="username"}}
    
    {{> afQuickField name="password"}}
    
    <button type="submit" class="btn btn-success btn-lg pull-right">Next</button>
    
  {{/autoForm}}
</template>

<template name="setupStepTwo">
  {{#autoForm schema=schema doc=data id="setup-step-two-form"}}
    
    {{> afQuickField name="confirm"}}
    
    <button type="submit" class="btn btn-success btn-lg pull-right">Submit</button>
    
  {{/autoForm}}
</template>
```

Then configure your schema's and steps

```js
Template.setupWizard.steps = function() {
  return [{
    id: 'stepOne',
    title: 'Stap 1. Your account',
    template: 'setupStepOne',
    formId: 'setup-step-one-form'
  }, {
    id: 'stepTwo',
    title: 'Stap 2. Confirm',
    template: 'setupStepTwo',
    formId: 'setup-step-two-form',
    onSubmit: function(data, mergedData) {
      Accounts.createUser(mergedData, function(err) {
        if(!err) Router.go('/');
      });
    }
  }]
}

Template.setupStepOne.schema = function() {
  return new SimpleSchema({
  	'username': {
  		type: String,
  		label: 'Username',
      min: 2,
      max: 30
  	},
    'password': {
  		type: String,
  		label: 'Password',
      min: 6
  	}
  });
}

Template.setupStepTwo.schema = function() {
  return new SimpleSchema({
    'password': {
  		type: Boolean,
  		label: 'Confirm your registration'
  	}
  });
}

```

## IronRouter support

You can also bind the wizard to IronRouter.

Add the following route to your router config.
 
```js
this.route('setup', {path: '/setup/:step'});
```

Add a route parameter to your wizard instance.
```html
<template name="setupWizard">
  {{> wizard id="setup-wizard" route="setup" steps=steps}}
</template>
```

## Todo

* Improve documentation
* Write some tests
* Probably more, just let me know or submit a pull request :)