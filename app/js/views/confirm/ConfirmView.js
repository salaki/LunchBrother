//OrderId, fname,lname,email,address
define([
  'models/order/PaymentModel',
  'views/order/OrderView',
  'text!templates/confirm/confirmTemplate.html'
], function(PaymentModel, OrderView, confirmTemplate) {

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
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });
  return ConfirmView;
});