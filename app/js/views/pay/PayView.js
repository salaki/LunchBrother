define([
  'text!templates/pay/payTemplate.html',
  'stripe'
], function(payTemplate){
  Stripe.setPublishableKey('pk_test_EMIAzyTdHHJaFEnWTNchuOTZ');
  var PayView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(payTemplate),
    
    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#pay"]').parent().addClass('active');
      this.$el.html(this.template());
    }

  });

  return PayView;
  
});