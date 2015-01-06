define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/confirm/confirmTemplate.html'
], function($, _, Backbone, confirmTemplate){

  var ConfirmView = Backbone.View.extend({
    el: $("#page"),
    
    template: _.template(confirmTemplate),
    
    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#pay"]').parent().addClass('active');
      this.$el.html(this.template());
    }

  });

  return ConfirmView;
  
});