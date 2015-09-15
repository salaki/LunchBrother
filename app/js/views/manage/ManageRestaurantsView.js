define([
  'text!templates/manage/manageRestaurantsTemplate.html'
], function (manageRestaurantsTemplate) {

    var ManageRestaurantsView = Parse.View.extend({
        el: $("#page"),

        events: {
            //TODO@Lian: Add a button event here to click to a method which directs the user to another page
            "click .toNewRestaurant": "toNewRestaurantPageClick"
        },

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(manageRestaurantsTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        toNewRestaurantPageClick: function() {
            window.location.href = '#newRestaurant';
        }
    });
    return ManageRestaurantsView;
});
