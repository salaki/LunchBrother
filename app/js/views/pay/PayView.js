define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/pay/payTemplate.html'
], function($, _, Backbone, payTemplate){

  var PayView = Backbone.View.extend({
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