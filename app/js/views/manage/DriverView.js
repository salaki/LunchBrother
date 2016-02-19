define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'models/dish/DishModel',
    'models/Grid',
    'models/Restaurant',
    'models/PickUpLocation',
    'models/InventoryModel',
    'models/Employee',
    'models/manage/DeliveryModel',
    'views/manage/LoginView',
    'text!templates/manage/driverTemplate.html'
], function(PaymentModel, OrderModel, DishModel, GridModel, RestaurantModel, PickUpLocationModel, InventoryModel, EmployeeModel, DeliveryModel, LoginView, driverTemplate) {

    var DriverView = Parse.View.extend({
        el: $("#page"),
        events: {
            'click #readyToGo': 'startSendingLocation',
            'click #done': 'stopSendingLocation'
        },

        driverLocation: null,
        deliveryId: null,

        initialize: function() {
            _.bindAll(this, 'render');
        },

        template: _.template(driverTemplate),

        render: function() {
            this.findTodayPickupInfo();
            return this;
        },

        findTodayPickupInfo: function() {
            var self = this;
            var currentUser = Parse.User.current();
            if (currentUser.get('permission') != LOCAL_MANAGER) {
                var employeeQuery = new Parse.Query(EmployeeModel);
                employeeQuery.equalTo("worker", currentUser);
                employeeQuery.first({
                    success: function(employee) {
                        self.findInventoryByManager(employee.get('manager'));

                    },
                    error: function(error) {
                        showMessage("Error", "Can't finding manager. Reason: " + error.message);
                    }
                });

            } else {
                this.findInventoryByManager(currentUser);
            }
        },

        findInventoryByManager: function(manager) {
            var self = this;
            var current = new Date();
            if (current.getHours() > 14) {
                // After 2PM, find tomorrow's invenotry
                var lowerDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                lowerDate.setHours(10, 0, 0, 0);
                var upperDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                upperDate.setHours(13, 0, 0, 0);

            } else {
                // Before 2PM, find today's inventory
                var lowerDate = new Date();
                lowerDate.setHours(10, 0, 0, 0);
                var upperDate = new Date();
                upperDate.setHours(13, 0, 0, 0);
            }

            var inventoryQuery = new Parse.Query(InventoryModel);
            inventoryQuery.equalTo("orderBy", manager);
            inventoryQuery.greaterThan("pickUpDate", lowerDate);
            inventoryQuery.lessThan("pickUpDate", upperDate);
            inventoryQuery.include("dish");
            inventoryQuery.include("dish.restaurant");
            inventoryQuery.include("pickUpLocation");
            inventoryQuery.find({
                success: function(inventories) {
                    var restaurantName = "";
                    var restaurantNumber = "";
                    var restaurantAddress = "";
                    var dishQuantity = "";
                    var pickUpLocationAddress = "";

                    _.each(inventories, function(inventory) {
                        if (!restaurantName) {
                            restaurantName = inventory.get('dish').get('restaurant').get('name');
                        }

                        if (!restaurantNumber) {
                            restaurantNumber = inventory.get('dish').get('restaurant').get('telnum');
                        }

                        if (!restaurantAddress) {
                            restaurantAddress = inventory.get('dish').get('restaurant').get('address');
                        }

                        if (!dishQuantity) {
                            dishQuantity = inventory.get('dish').get('dishName') + " - " + inventory.get('totalOrderQuantity');
                        } else {
                            dishQuantity += "; " + inventory.get('dish').get('dishName') + " - " + inventory.get('totalOrderQuantity');
                        }

                        if (!pickUpLocationAddress) {
                            pickUpLocationAddress = inventory.get("pickUpLocation").get("address");
                        }
                    });

                    self.$el.html(self.template({pickUpAddress: pickUpLocationAddress, dishQuantity: dishQuantity}));

                    self.$("#resName").html(restaurantName);
                    self.$("#resNumber").html(restaurantNumber);
                    self.$("#resAddress").html(restaurantAddress);
                    self.$("#dishQuan").html(dishQuantity);
                },
                error: function(error) {
                    console.log(error.message);
                }
            });
        },

        savePosition: function(position) {
            console.log("Sending location...");
            var deliveryModel = new DeliveryModel();
            var currentUser = Parse.User.current();
            if(this.deliveryId != null) {
                deliveryModel.id = this.deliveryId;
            }
            var self = this;
            deliveryModel.set('deliverBy', currentUser);
            deliveryModel.set('status', "On the way");
            deliveryModel.set('grid', {
                __type: "Pointer",
                className: "Grid",
                objectId: currentUser.get("gridId").id});
            deliveryModel.set('longitude', position.coords.longitude);
            deliveryModel.set('latitude', position.coords.latitude);
            deliveryModel.save({
                success: function(delivery) {
                    self.deliveryId = delivery.id;
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        },

        errorHandler: function(err) {
            if(err.code == 1) {
                alert("Error: Access is denied!");
            }

            else if( err.code == 2) {
                alert("Error: Position is unavailable!");
            }
        },

        startSendingLocation: function(){
            $("#readyToGo").addClass('disabled');
            if(navigator.geolocation){
                var options = {timeout:60000};
                geoLoc = navigator.geolocation;
                watchID = geoLoc.watchPosition(this.savePosition, this.errorHandler, options);
            } else {
                alert("Sorry, your browser does not support geolocation!");
            }
        },

        stopSendingLocation: function() {
            console.log("Stop recording location!");
            $("#readyToGo").removeClass('disabled');
            geoLoc.clearWatch(watchID);
            if(navigator.geolocation){
                var options = {timeout:60000};
                navigator.geolocation.getCurrentPosition(this.saveLastPosition, this.errorHandler, options);
            }
            else {
                alert("Sorry, browser does not support geolocation!");
            }
        },

        saveLastPosition: function(position) {
            var self = this;
            var currentUser = Parse.User.current();
            var deliveryModel = new DeliveryModel();
            deliveryModel.id = this.deliveryId;
            deliveryModel.set('deliverBy', currentUser);
            deliveryModel.set('status', "On the way");
            deliveryModel.set('grid', {
                __type: "Pointer",
                className: "Grid",
                objectId: currentUser.get("gridId").id});
            deliveryModel.set('longitude', position.coords.longitude);
            deliveryModel.set('latitude', position.coords.latitude);
            deliveryModel.save({
                success: function(delivery) {
                    self.deliveryId = null;
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });

        }
    });
    return DriverView;
});
