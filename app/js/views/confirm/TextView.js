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

    initialize: function() {
      _.bindAll(this, 'render','getOrderId');
      Parse.Events.on("orderId", this.getOrderId, this)
    },

    template: _.template(textTemplate),

    render: function() {
      this.$el.html(this.template());
      return this;
    },
    
    getOrderId:function(){
      console.log(this.orderId);
    }
  });
  return TextView;
});