/**
 * Created by Jack on 7/13/15.
 */
define([
    'models/Grid',
    'models/Restaurant',
    'models/InventoryModel',
    'models/dish/DishModel',
    'text!templates/manage/menuEditTemplate.html',
    'text!templates/manage/menuEditDishListTemplate.html'
], function(GridModel, RestaurantModel, InventoryModel, DishModel, menuEditTemplate, menuEditDishListTemplate) {

    var MenuEditView = Parse.View.extend({
        el: $("#page"),
        template: _.template(menuEditTemplate),
        menuEditDishListTemplate: _.template(menuEditDishListTemplate),

        events: {
            'click #menuEditCancelBtn': 'onCancelClick',
            'click #menuEditSaveBtn': 'onSaveClick'
        },
        
        initialize: function() {
            _.bindAll(this, 'render');
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                currentUser.fetch();
                $("#userEmail").text(currentUser.get('email'));
                var gridId = "nmbyDzTp7m";
                if (currentUser.get('gridId') == undefined) {
                    $("#userGrid").text("University of Maryland College Park");
                }else {
                    var gridQuery = new Parse.Query(GridModel);
                    gridId = currentUser.get('gridId').id;
                    gridQuery.get(currentUser.get('gridId').id, {
                        success: function(grid) {
                            $("#userGrid").text(grid.get('name'));
                        },
                        error: function(object, error) {
                            console.log(error.message);
                        }
                    });
                }
                $("#userPhone").text(currentUser.get('telnum'));
                $("#userFullName").text(currentUser.get('firstName') + " " + currentUser.get('lastName'));
                $("#userCreditBalance").text(currentUser.get('creditBalance').toFixed(2));
                $("#accountBarFirstName").text(currentUser.get('firstName'));
            }
            $('#account').show();
        },

        render: function() {
            var inventoryIds = this.options.inventoryIds;
            var date = this.options.date;
            var inventoryArray = inventoryIds.split(",");

            var self = this;
            var currentUser = Parse.User.current();
            var restaurantQuery = new Parse.Query(RestaurantModel);
            restaurantQuery.equalTo("gridId", currentUser.get('gridId'));
            restaurantQuery.find({
                success:function(restaurants) {
                    self.$el.html(self.template({restaurants: restaurants, date: date}));
                    self.$(".restaurant-selection").dropdown({
                        onChange: function (restaurantId) {
                            self.refreshInventoryMenu(restaurantId, inventoryArray);
                        }
                    });
                    self.refreshInventoryMenu("", inventoryArray);
                },
                error: function(err) {
                    console.log(err.message);
                }
            });
        },

        refreshInventoryMenu: function(restaurantId, inventoryArray) {
            var self = this;

            if (inventoryArray[0] !== "") {
                var inventoryQuery = new Parse.Query(InventoryModel);
                inventoryQuery.containedIn("objectId", inventoryArray);
                inventoryQuery.include("dish");
                inventoryQuery.find({
                    success:function(inventories) {
                        var dishes = [];
                        _.each(inventories, function(inventory) {
                                var dish = inventory.get('dish');
                                dish.quantity = inventory.get('preorderQuantity');
                                dishes.push(dish);
                            }
                        );

                        self.$(".restaurant-selection").dropdown(
                            'set selected', dishes[0].get('restaurant').id
                        );

                        self.$("#menuEditDishList").html(self.menuEditDishListTemplate({dishes : dishes}));
                    },
                    error: function(err) {
                        console.log(err.message);
                    }
                });
            } else {
                var dishQuery = new Parse.Query(DishModel);
                dishQuery.equalTo("restaurant", {
                    __type:"Pointer",
                    className: "Restaurant",
                    objectId: restaurantId
                });

                dishQuery.find({
                    success: function(dishes){
                        self.$("#menuEditDishList").html(self.menuEditDishListTemplate({dishes : dishes}));
                    },
                    error: function(err){
                        console.log(err.message);
                    }
                });
            }
        },

        onSaveClick: function() {
            //TODO@Jack - Save added dishes to inventory
            alert("Under construction!");
        },

        onCancelClick: function() {
            window.location.hash = "#managerHome";
        }
    });
    return MenuEditView;
});
