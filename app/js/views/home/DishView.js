define([
  'models/dish/DishModel',
  'text!templates/home/dishTemplate.html'
], function(DishModel,dishTemplate) {
  var DishView = Parse.View.extend({

    template: _.template(dishTemplate),
    
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }

  });

  return DishView;
});