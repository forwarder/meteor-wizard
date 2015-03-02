AutoForm Wizard
=============

AutoForm Wizard is a multi step form component for AutoForm.


## Installation

```
$ meteor add forwarder:autoform-wizard
```


## Dependencies

* AutoForm versions 3 or 4.
* Iron Router support is optional, works with version 1.
* amplify (deprecated, will be replaced soon).


## Example

A running example can be found here:
http://autoform-wizard.meteor.com

The source code of the example app can be found on Github.
https://github.com/forwarder/meteor-wizard-example

## Basic usage

### Create templates for the wizard

```html
<template name="basicWizard">
  {{> wizard id="basic-wizard" steps=steps}}
</template>

<template name="information">
  {{> quickform id="information-form" doc=data schema=schema}}
</template>

<template name="confirm">
  {{> quickForm id="confirm-form" doc=data schema=schema}}
</template>
```

### Define the steps in a template helper

```js
Template.basicWizard.helpers({
  steps: function() {
    return [{
      id: 'information',
      title: 'Information',
      template: 'information',
      formId: 'information-form'
    },{
      id: 'confirm',
      title: 'Confirm',
      template: 'confirm',
      formId: 'confirm-form',
      onSubmit: function(data, wizard) {
        // submit logic
      }
    }]
  }
});
```


## Component reference

### Wizard configuration

The following attributes are supported:

* `id`: Required. The id used to identify the wizard.
* `route`: Optional. The (Iron Router) route name this wizard will be bound to, the route needs a `step` parameter.
* `steps`: Required. A list of steps for this wizard.
  * `id`: Required. Id of the step, also used for the route parameter.
  * `title`: Optional. The title displayed in the breadcrumbs.
  * `template`: Optional. Uses a default template with a quickform if not set.
  * `schema`: Optional. Only required if don't use a custom template.
  * `formId`: Optional. The AutoForm form id used in the template. Appends '-form' to the step.id if not set. Used to attach submit handlers and retreive the step data.
  * `onSubmit`: Optional. This function is executed after the form is submitted and validates. `this` references to the AutoForm instance. Shows the next step by default. Parameters:
      * `data`: The current step data.
      * `wizard`: The wizard instance.
* `persist`: Optional. Persist the step data in localStorage. Defaults to `true`.
* `clearOnDestroy`: Optional. Clear the cache storage after closing the wizard. Defaults to `false`.
* `stepsTemplate`: Optional. A custom steps template.

#### onSubmit
Use this callback to process the form data.
```js
onSubmit: function(data, wizard) {
  var self = this;
  Orders.insert(_.extend(wizard.mergedData(), data), function(err, id) {
    if (err) {
      self.done();
    } else {
      Router.go('viewOrder', {
        _id: id
      });
    }
  });
}
```

Arguments:

* `data`: Form data of the current step.
* `wizard`: The wizard instance.

`this` references to the AutoForm instance, see the [AutoForm documentation](https://github.com/aldeed/meteor-autoform#onsubmit) for more information.

### Wizard instance methods

The wizard instance is added to your step templates data context, so you can access these methods in your event handlers etc.

* `mergedData()`: Get all data from previous steps. Does not include data of the current step in the onSubmit callback.
* `next()`: Go to the next step.
* `previous()`: Go to the previous step.
* `show(id)`: Show a specific step by id or index.

Example usage:
```js
Template.wizardStep2.events({
  'click .back': function(e, template) {
    e.preventDefault();
    this.wizard.previous();
  }
});
```


## IronRouter support

You can also bind the wizard to Iron Router.

Add a new route to your router config, with the :step parameter.
 
```js
Router.route('/order/:step', {name: 'order'});
```

Add a route parameter with the name of the route to your wizard instance.
```
{{> wizard id="order-wizard" route="order" steps=steps}}
```


## Todo

* Replace amplify
* Improve documentation
* Write some tests
* Probably more, just let me know or submit a pull request :)