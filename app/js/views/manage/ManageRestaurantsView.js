define([
    'models/Restaurant',
    'models/dish/DishModel',
    'text!templates/manage/manageRestaurantsTemplate.html',
    'text!templates/manage/manageRestaurantDishListTemplate.html'
], function (RestaurantModel, DishModel, manageRestaurantsTemplate, manageRestaurantDishListTemplate) {

    var ManageRestaurantsView = Parse.View.extend({
        el: $("#page"),

        events: {
            "click .toNewRestaurant": "toNewRestaurantPageClick"
        },

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(manageRestaurantsTemplate),
        dishListTemplate: _.template(manageRestaurantDishListTemplate),

        render: function () {
            var self = this;
            var restaurantQuery = new Parse.Query(RestaurantModel);
            restaurantQuery.find({
                success: function(restaurants) {
                    self.$el.html(self.template({restaurants: restaurants}));
                    $(".manage-restaurant-selection").dropdown({
                        onChange: function (restaurantId) {
                            self.refreshDishList(restaurantId);
                        }
                    });
                },
                error: function(error) {
                    alert("Find restaurants failed! Reason: " + error.message);
                }
            });
        },

        refreshDishList: function(restaurantId) {
            console.log(restaurantId);
            //TODO@Lian - Step 1. Use Parse Query command to find the dishes belong to restaurantId (Use DishModel)
            //TODO@Lian - Step 2. Once you find the dishes, pass the dishes object to the dishListTemplate like:
            //TODO@Lian -         self.$("#dishList").html(self.template({dishes: dishes}))
            //TODO@Lian - (Hint: You can look at above method or https://parse.com/docs/js/guide for your reference)
        },

        toNewRestaurantPageClick: function() {
            window.location.href = '#newRestaurant';
        }
    });
    return ManageRestaurantsView;
});
