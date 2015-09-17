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
            var self = this;
            console.log(restaurantId);
            var dishQuery = new Parse.Query(DishModel);
            dishQuery.equalTo(restaurantId);
            dishQuery.find({
                success: function(dishes) {
                    self.$("#dishList").html(self.dishListTemplate({dishes: dishes}));
                },
                error: function(error) {
                    alert("Find dishes failed! Reason: " + error.message);
                }
            });
        },

        toNewRestaurantPageClick: function() {
            window.location.href = '#newRestaurant';
        }
    });
    return ManageRestaurantsView;
});
