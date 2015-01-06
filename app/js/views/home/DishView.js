define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/dishTemplate.html'
], function($, _, Backbone, dishTemplate) {
  var DishView = Backbone.View.extend({

    template: _.template(dishTemplate),
    
    render: function() {
      this.$el.html(this.template());
      return this;
    }

  });

  return DishView;
});