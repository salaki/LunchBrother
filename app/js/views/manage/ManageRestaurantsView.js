define([
    'models/Restaurant',
    'models/dish/DishModel',
    'text!templates/manage/manageRestaurantsTemplate.html',
    'text!templates/manage/manageRestaurantDishListTemplate.html'
], function (RestaurantModel, DishModel, manageRestaurantsTemplate, manageRestaurantDishListTemplate) {

    var ManageRestaurantsView = Parse.View.extend({
        el: $("#page"),

        events: {
            "click .toNewRestaurant": "toNewRestaurantPageClick",
            "click .deleteDish": "onDeleteDishClick",
            "click #editRestaurant": "onEditRestaurantClick",
            "click #deleteRestaurant": "onDeleteRestaurantClick"
        },

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(manageRestaurantsTemplate),
        dishListTemplate: _.template(manageRestaurantDishListTemplate),

        render: function () {
            var self = this;
            //TODO@Lian - Query users where permission equals to LOCAL_MANAGER
            //TODO@Lian - In the success call back include continueQueryRestaurant function and also pass in returned users
        },

        continueQueryRestaurant: function(managers) {
            var self = this;
            var restaurantQuery = new Parse.Query(RestaurantModel);
            restaurantQuery.find({
                success: function(restaurants) {
                    self.$el.html(self.template({restaurants: restaurants, managers: managers}));
                    $("#editRestaurant").addClass('disabled');
                    $("#deleteRestaurant").addClass('disabled');
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
            var newEvent = {"click #addNewDishBtn": 'toNewDishPage'};
            this.delegateEvents(_.extend(this.events, newEvent));

            if (restaurantId) {
                $("#editRestaurant").removeClass('disabled');
                $("#deleteRestaurant").removeClass('disabled');
            } else {
                $("#editRestaurant").addClass('disabled');
                $("#deleteRestaurant").addClass('disabled');
            }

            var self = this;
            var dishQuery = new Parse.Query(DishModel);
            dishQuery.equalTo("restaurant", {
                __type: "Pointer",
                className: "Restaurant",
                objectId: restaurantId
            });
            dishQuery.find({
                success: function(dishes) {
                    self.$("#dishList").html(self.dishListTemplate({dishes: dishes}));
                },
                error: function(error) {
                    alert("Find dishes failed! Reason: " + error.message);
                }
            });
        },

        toNewDishPage: function() {
            window.location.href='#newdish?restaurantId=' + $(".manage-restaurant-selection").dropdown('get value');
        },

        toNewRestaurantPageClick: function() {
            window.location.href = '#newRestaurant';
        },

        onEditRestaurantClick: function() {
            window.location.href = '#editRestaurant?id=' + $(".manage-restaurant-selection").dropdown('get value');
        },

        onDeleteRestaurantClick: function() {
            $("#deleteContent").html("Do you really want to delete this restaurant?");
            $('#deleteDishOrRestaurantDialog').modal({
                closable: false,
                onDeny: function () {
                    //Do nothing
                },
                onApprove: function () {
                    var restaurant = new RestaurantModel();
                    restaurant.id = $(".manage-restaurant-selection").dropdown('get value');
                    restaurant.destroy({
                        success: function(restaurant) {
                            alert("Delete restaurant successfully!");
                            location.reload();
                        },
                        error: function(restaurant, error) {
                            alert("Delete restaurant failed! Reason: " + error.message);
                        }
                    });
                }
            }).modal('show');
        },

        onDeleteDishClick: function(ev) {
            var dishId = $(ev.currentTarget).data('id');
            alert("This function is still under construction");
            //TODO - Need more discussion to implement the delete function
        }
    });
    return ManageRestaurantsView;
});
