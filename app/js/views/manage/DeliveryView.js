define([
  'text!templates/manage/deliveryTemplate.html'
], function(deliveryTemplate){
	
  var DeliveryView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(deliveryTemplate),
    
    render: function(){
      this.$el.html(this.template());
      return this;
    }

  });
  return DeliveryView;
});