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
    title: 'Step 1. Your account',
    template: 'setupStepOne',
    formId: 'setup-step-one-form'
  }, {
    id: 'stepTwo',
    title: 'Step 2. Confirm',
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

## Component reference

wizard

The following attributes are supported:

* `id` Required. The id used to identify the wizard.
* `route` Optional. The (IronRouter) route name this wizard will be bound to, the route needs a `step` parameter.
* `steps` Required. A list of steps for this wizard.
  * `id` Required. Id of the step, also used for the route parameter.
  * `title` Optional. The title displayed in the breadcrumbs.
  * `template` Required. Template for this step, be sure to setup an AutoForm in the template.
  * `formId` Required. The AutoForm form id used in the template. Used to attach submit handlers and retreive the step data.
  * `onSubmit` Optional. This function is executed after the form is submitted and validates. Shows the next step by default. Parameters:
      * `data` The current step data.
      * `mergedData` Merged data of all steps.
* `persist` Optional. Persist the step data using amplify, . Defaults to `true`.
* `expires` Optional. Expire the persisted data after [x] miliseconds. Defaults to `null`

## Todo

* Improve documentation
* Write some tests
* Probably more, just let me know or submit a pull request :)