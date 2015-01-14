define([
  'text!templates/delivery/deliveryTemplate.html'
], function(deliveryTemplate){

  var DeliveryView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(deliveryTemplate),
    
    render: function(){
      this.$el.html(this.template());
    }

  });

  return DeliveryView;
  
});