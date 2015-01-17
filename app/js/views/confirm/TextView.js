//OrderId&Email
define([
  'models/order/PaymentModel',
  'models/order/SequenceModel',
  'text!templates/confirm/textTemplate.html'
], function(PaymentModel, SequenceModel, textTemplate) {

  var TextView = Parse.View.extend({

    tagName: "div",
    attributes: {
      class: 'column'
    },

    initialize: function(options) {
      _.bindAll(this, 'render');
    },

    template: _.template(textTemplate),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  return TextView;
});