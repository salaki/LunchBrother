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
      _.bindAll(this, 'render', 'addOne', 'minusOne');
      this.model.bind('change:count', this.render);
    },

    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        if (this.model.get('count') == 4) {
            $('#' + this.model.id + '-dimmer').dimmer('show');
            $('#' + this.model.id + '-plusButton').prop('disabled', true);
        } else {
            $('#' + this.model.id + '-dimmer').dimmer('hide');
        }
        $('#' + this.model.id + ' .menu .item').tab({context: $('#' + this.model.id)});
        $('.ui.rating')
            .rating()
            ;
      //this.delegateEvents();
      return this;
    },

    addOne: function() {
      this.model.addOne();
    },

    minusOne: function() {
      this.model.minusOne();
    }
  });
  return DishView;
});
