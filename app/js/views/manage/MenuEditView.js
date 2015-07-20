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

        initialInventories: [],
        addedInventories: [],
        
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
                    $(".restaurant-selection").dropdown({
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
            this.addedInventories = [];
            this.initialInventories = [];

            /**
             * Get Inventory
             */
            var inventoryQuery = new Parse.Query(InventoryModel);
            inventoryQuery.containedIn("objectId", inventoryArray);
            inventoryQuery.include("dish");
            inventoryQuery.find({
                success:function(inventories) {
                    var dishes = [];
                    _.each(inventories, function(inventory) {
                            var dish = inventory.get('dish');
                            dish.quantity = inventory.get('preorderQuantity');
                            dish.inventoryId = inventory.id;
                            dishes.push(dish);

                            var inventory = {
                                id: inventory.id,
                                dishId: dish.id,
                                quantity: dish.quantity,
                                price: dish.get('Unit_Price')
                            };
                            self.addedInventories.push(inventory);
                            self.initialInventories.push(inventory);
                        }
                    );

                    /**
                     * Set Restaurant Selector Value
                     */
                    var finalRestaurantId = restaurantId;
                    if (inventoryArray[0] !== "") {
                        finalRestaurantId = dishes[0].get('restaurant').id;
                        self.$(".restaurant-selection").dropdown(
                            'set selected', finalRestaurantId
                        );
                    }

                    /**
                     * Get restaurant dishes and compare with inventory dishes then fill up the rest dishes
                     */
                    var dishQuery = new Parse.Query(DishModel);
                    dishQuery.equalTo("restaurant", {
                        __type:"Pointer",
                        className: "Restaurant",
                        objectId: finalRestaurantId
                    });

                    dishQuery.find({
                        success: function(restaurantDishes){
                            //Remove inventory dishes from restaurant dishes
                            _.each(dishes, function(inventoryDish){
                                restaurantDishes = _.reject(restaurantDishes, function(el) {
                                    return el.id === inventoryDish.id;
                                });
                            });

                            //Add remainder restaurant dishes
                            _.each(restaurantDishes, function(restaurantDish){
                                dishes.push(restaurantDish);
                            });

                            self.$("#menuEditDishList").html(self.menuEditDishListTemplate({dishes : dishes}));
                            self.setButtonsAndAddInventories(dishes);
                        },
                        error: function(err){
                            console.log(err.message);
                        }
                    });
                },
                error: function(err) {
                    console.log(err.message);
                }
            });
        },

        setButtonsAndAddInventories: function(dishes) {
            var self = this;
            _.each(dishes, function(dish) {
                //Mark inventory dishes as added
                if (dish.inventoryId) {
                    $('#dimmer-' + dish.id).addClass("active");
                }

                /**
                 * Set input value onChange events
                 */
                $("#dishQuantityInput-" + dish.id).keyup(function(){
                    $('#dimmer-' + dish.id).removeClass("active");
                    self.addedInventories = _.reject(self.addedInventories, function (el) {
                        return el.dishId === $('#dishIdInput-' + dish.id).val();
                    });
                });
                $("#dishPriceInput-" + dish.id).keyup(function(){
                    $('#dimmer-' + dish.id).removeClass("active");
                    self.addedInventories = _.reject(self.addedInventories, function (el) {
                        return el.dishId === $('#dishIdInput-' + dish.id).val();
                    });
                });

                $('#addToMenuBtn-' + dish.id).click(function(){
                    if ($('#dimmer-' + dish.id).dimmer("is active")) {
                        $('#dimmer-' + dish.id).removeClass("active");
                        self.addedInventories = _.reject(self.addedInventories, function(el) {
                            return el.dishId === $('#dishIdInput-' + dish.id).val();
                        });
                    } else {
                        var quantity = $('#dishQuantityInput-' + dish.id).val();
                        var price = $('#dishPriceInput-' + dish.id).val();

                        //Validate quantity and price inputs
                        if (!self.isInteger(quantity)) {
                            alert("Quantity has to be an integer number!");
                            return;
                        }

                        if (!Number(price)) {
                            alert("Price has to be a number!");
                            return;
                        }

                        $('#dimmer-' + dish.id).addClass("active");
                        var inventory = {
                            id: $('#inventoryId-' + dish.id).val(),
                            dishId: $('#dishIdInput-' + dish.id).val(),
                            quantity: quantity,
                            price: price
                        };
                        self.addedInventories.push(inventory);
                    };
                });
            });
        },

        isInteger: function(n) {
            return Number(n) && Number(n) % 1 === 0;
        },

        onSaveClick: function() {
            /**
             * Destroy removed inventories
             */
            var self = this;
            _.each(this.addedInventories, function(addedInventory) {
                self.initialInventories = _.reject(self.initialInventories, function(el) {
                    return el.id === addedInventory.id;
                });
            });

            var toDestroyInventories = [];
            _.each(this.initialInventories, function(inventory) {
                var toDestoryInventory = new InventoryModel();
                toDestoryInventory.id = inventory.id;
                toDestroyInventories.push(toDestoryInventory);
            });

            Parse.Object.destroyAll(toDestroyInventories, {
                success: function(success) {
                    //Do nothing
                },
                error: function(error) {
                    alert('Destroy failed! Reason: ' + error.message + "To destroy inventories: " + toDestroyInventories);
                }
            });

            /**
             * Save added dishes to inventory
             */
            var currentUser = Parse.User.current();
            var toSaveInventories = [];
            var datePart = this.options.date.split(" ")[0];
            var month = datePart.split("/")[0], date = datePart.split("/")[1];
            var pickUpdate = new Date();
            pickUpdate.setMonth(month - 1);
            pickUpdate.setDate(date);
            pickUpdate.setHours(11, 0, 0, 0);

            _.each(this.addedInventories, function(inventory) {
                var toSaveInventory = new InventoryModel();
                if (inventory.id !== undefined) {
                    toSaveInventory.id = inventory.id;
                }
                var dish = new DishModel();
                dish.id = inventory.dishId;
                toSaveInventory.set("dishId", inventory.dishId);
                toSaveInventory.set("dish", dish);
                toSaveInventory.set("published", false);
                toSaveInventory.set("preorderQuantity", parseInt(inventory.quantity));
                toSaveInventory.set("currentQuantity", parseInt(inventory.quantity));
                toSaveInventory.set("orderBy", currentUser);
                toSaveInventory.set("status", "Unconfirmed");
                toSaveInventory.set("pickUpDate", pickUpdate);
                toSaveInventories.push(toSaveInventory);
            });


            Parse.Object.saveAll(toSaveInventories, {
                success: function(inventories) {
                    // Do nothing for now
                },
                error: function(error) {
                    alert('Save failed! Reason: ' + error.message);
                }
            });

            this.onCancelClick();
        },

        onCancelClick: function() {
            this.initialInventories = [];
            this.addedInventories = [];
            window.location.hash = "#managerHome";
        }
    });
    return MenuEditView;
});
