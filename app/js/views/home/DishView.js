define([
  'models/dish/DishModel',
  'text!templates/home/dishTemplate.html'
], function(DishModel, dishTemplate) {

  var DishView = Parse.View.extend({
   
    tagName: "div",
    attributes: {
      class: 'column'
    },
    template: _.template(dishTemplate),
   
    events: {
      'click .plusone': 'addOne',
      'click .minusone': 'minusOne'
    },

    initialize: function() {
    	this.model.initialize();
      _.bindAll(this, 'render', 'addOne', 'minusOne');
      this.model.bind('change:count', this.render);
      $('.pointing.menu .item').tab();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      //this.delegateEvents();
      return this;
    },

    addOne: function() {
      this.model.addOne();
    },

    minusOne: function() {
      this.model.minusOne();
    },

  });
  return DishView;
});
