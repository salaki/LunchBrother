define([
  'text!templates/status/statusTemplate.html'
], function(statusTemplate){

  var StatusView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(statusTemplate),
    
    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#status"]').parent().addClass('active');
      this.$el.html(this.template());
    }

  });

  return StatusView;
  
});