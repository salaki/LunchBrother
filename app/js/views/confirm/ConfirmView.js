define([
  'models/order/PaymentModel',
  'models/order/SequenceModel',
  'views/order/OrderView',
  'text!templates/confirm/confirmTemplate.html'
], function(PaymentModel, SequenceModel, OrderView, confirmTemplate) {

  var ConfirmView = Parse.View.extend({

    tagName: "div",
    attributes: {
      class: 'column'
    },

    initialize: function() {
      _.bindAll(this, 'render');
    },

    template: _.template(confirmTemplate),

    render: function() {
      
      this.$el.html(this.template());
      return this;
    },
  });
  return ConfirmView;
});