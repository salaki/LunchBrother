define([
    'text!templates/manage/newRestaurantTemplate.html'

    ], function (newRestaurantTemplate) {

      var NewRestaurantView = Parse.View.extend({
        el: $("#page"),

          initialize: function () {
            _.bindAll(this, 'render');

          },

          template: _.template(newRestaurantTemplate),

          render: function () {
            this.$el.html(this.template());
            return this;

          }

      });
      return NewRestaurantView;

    });



