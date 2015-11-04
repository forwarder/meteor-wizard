AutoForm Wizard
=============

AutoForm Wizard is a multi step form component for AutoForm.


## Installation

```
$ meteor add forwarder:autoform-wizard
```

## Upgrade notice

### Upgrading to 0.7.*
Iron router support has been moved to a separate package.
See the [Using routers](#routers) section to see how to enable it.


## Dependencies

* AutoForm versions 5.


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
```

### Define the steps in a template helper

```js
Schema = {};
Schema.information = new SimpleSchema(...);
Schema.confirm = new SimpleSchema(...);

Template.basicWizard.helpers({
  steps: function() {
    return [{
      id: 'information',
      title: 'Information',
      schema: Schema.information
    },{
      id: 'confirm',
      title: 'Confirm',
      schema: Schema.confirm,
      onSubmit: function(data, wizard) {
        // submit logic
      }
    }]
  }
});
```


## Custom step templates

If you need more flexibility in your forms, you can define your own templates to be used for the steps.

### Define your templates and include AutoForm

```html
<template name="information">
  {{> quickform id="information-form" doc=step.data schema=step.schema}}
</template>
```

or

```html
<template name="confirm">
  {{#autoForm id="confirm-form" doc=step.data schema=step.schema}}

    {{> afQuickField name="acceptTerms"}}

    {{> wizardButtons}} /* this will render back, next and confirm buttons */

  {{/autoForm}}
</template>
```

### Configure steps

```js
Template.basicWizard.helpers({
  steps: function() {
    return [{
      id: 'information',
      title: 'Information',
      template: 'information',
      formId: 'information-form',
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
  * `formId`: Optional. The AutoForm form id used in the template. Appends '-form' to the step.id if not set. Used to attach submit handlers and retrieve the step data.
  * `data`: Optional. Object with initial data for the step, for example a document, when using an update form. *Overwrites previous saved data*.
  * `onSubmit`: Optional. This function is executed after the form is submitted and validates. `this` references to the AutoForm instance. Shows the next step by default. Parameters:
      * `data`: The current step data.
      * `wizard`: The wizard instance.
* `buttonClasses`: Optional. CSS classes to add to the buttons.
* `nextButton`: Optional. Defaults to `Next`.
* `backButton`: Optional. Defaults to `Back`. Set to `false`, to not render this button.
* `confirmButton`: Optional. Defaults to `Confirm`.
* `persist`: Optional. Persist the step data in localStorage. Defaults to `true`.
* `clearOnDestroy`: Optional. Clear the cache storage after closing the wizard. Defaults to `false`.
* `stepsTemplate`: Optional. A custom steps template.
* `stepTemplate`: Optional. A custom default template for each step.

#### Custom attributes
Wizard configuration attributes can be extended with `Wizard.extendOptions`
```js
  Wizard.extendOptions(['wizardClass']);
```
with default value:
```js
  Wizard.extendOptions(['wizardClass'], {wizardClass: 'nav-wizard'});
```

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
* `isFirstStep([id])`: Omit the id argument to use the active step.
* `isLastStep([id])`: Omit the id argument to use the active step.
* `indexOf(id)`: Get the index of the specified step id.

Example usage:
```js
Template.wizardStep2.events({
  'click .back': function(e, template) {
    e.preventDefault();
    this.wizard.previous();
  }
});
```


## Using routers <a name="routers"></a>

It's possible to bind the wizard to a router. Iron Router and Flow Router are supported by default.
If you're using a different router, it's easy to setup custom bindings.

### Configuring a router

* note that `Wizard` is only available in client code.

1. First add the route name you want to use to your wizard instance.
```
{{> wizard id="order-wizard" route="order" steps=steps}}
```

#### Iron Router
First add the Wizard Iron Router package.
```
meteor add forwarder:autoform-wizard-iron-router
```

Enable the router bindings.
```js
Wizard.useRouter('iron:router');
```

Add a new route to your router config, with the :step parameter.
```js
Router.route('/order/:step', {name: 'order'});
```

#### Flow Router
First add the Wizard Flow Router package.
```
meteor add forwarder:autoform-wizard-flow-router
```

Enable the router bindings.
```js
Wizard.useRouter('kadira:flow-router');
```

Add a new route to your router config, with the :step parameter.
```js
FlowRouter.route('/order/:step', {name: 'order'});
```

### Custom router bindings

If you use a different router you can easily setup custom bindings.
This example will you show how to bind the wizard to Flow Router (meteorhacks:flow-router).

```js
Wizard.registerRouter('kadira:flow-router', {
  go: function(name, stepId) {
    FlowRouter.go(name, this.getParams(stepId));
  },
  getParams: function(stepId) {
    var route = Router.current()
      , params = route.params || {};

    return _.extend(params, {step: stepId});
  },
  getStep: function() {
    return FlowRouter.getParam('step');
  },
  path: function(name, stepId) {
    return FlowRouter.path(name, this.getParams(stepId));
  }
});

```

Then to enable Flow Router add the following line to your client code.

```js
Wizard.useRouter('kadira:flow-router');
```


## Todo

* Improve documentation
* Write some tests
* Probably more, just let me know or submit a pull request :)
