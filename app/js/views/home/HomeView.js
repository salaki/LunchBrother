define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/DishView',
  'text!templates/home/homeTemplate.html'
], function($, _, Backbone, DishView, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#page"),
    
    template: _.template(homeTemplate),
    
    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      this.$el.html(this.template());
      
      var dishView = new DishView();
      this.$el.find('#dishList').html(dishView.render().$el.html());
    }

  });

  return HomeView;
  
});