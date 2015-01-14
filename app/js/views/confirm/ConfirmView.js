define([
  'text!templates/confirm/confirmTemplate.html'
], function(confirmTemplate){

  var ConfirmView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(confirmTemplate),
    
    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      this.$el.html(this.template());
    }

  });

  return ConfirmView;
  
});