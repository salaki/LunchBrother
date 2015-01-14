define([
  'text!templates/delivery/deliveryTemplate.html'
], function(deliveryTemplate){
	
  var DeliveryView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(deliveryTemplate),
    
    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#pay"]').parent().addClass('active');
      this.$el.html(this.template());
    }

  });

  return DeliveryView;
  console.log('deliveryView returned');
});