//OrderId&Email
define([
  'models/order/PaymentModel',
  'text!templates/confirm/textTemplate.html',
  'i18n!nls/text'
], function(PaymentModel,textTemplate, text) {

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
	 	this.$("#thanks").html(text.thanks);
	 	this.$("#orderId").html(text.orderId);
	 	this.$("#confirmEmail").html(text.confirmEmail);
	 	this.$("#ifNoEmail").html(text.ifNoEmail);
      return this;
    }
  });
  return TextView;
});