define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'models/Grid',
    'models/Restaurant',
    'models/PickUpLocation',
    'views/manage/LoginView',
    'text!templates/manage/deliveryTemplate.html'
], function(PaymentModel, OrderModel, GridModel, RestaurantModel, PickUpLocationModel, LoginView, deliveryTemplate) {

    var DeliveryView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
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

        template: _.template(deliveryTemplate),

        render: function() {
            var self = this;
//            var query = new Parse.Query(PaymentModel);
//            this.applyQuery(query, self);
            this.applyQuery2(self);
            return this;
        },

        applyQuery2: function(self) {
            var restaurantQuery = new Parse.Query(RestaurantModel);
            restaurantQuery.equalTo("manager", Parse.User.current());
            restaurantQuery.find({
                success: function(restaurants) {
                    var orderQuery = new Parse.Query(OrderModel);
                    var chefGrid = Parse.User.current().get('gridId');
                    //default chef's grid to University of Maryland College Park
                    if (chefGrid == undefined){
                        chefGrid = new GridModel();
                        chefGrid.id = "nmbyDzTp7m";
                    }
                    var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
                    pickUpLocationQuery.equalTo("gridId", chefGrid);
                    pickUpLocationQuery.find({
                        success: function(locations) {
                            var orderSummary = [];
                            orderQuery.equalTo("restaurantId", restaurants[0]);
                            orderQuery.find({
                                success: function(orders) {
                                    var locationNames = [locationName1, locationName2, locationName3, 'total'];
                                    var orderMap =
                                    {
                                        locationName1: {
                                            dishNames: [],
                                            quantities: [],
                                            subTotalPrices: []
                                        },

                                        locationName2: {
                                            dishNames: [],
                                            quantities: [],
                                            subTotalPrices: []
                                        }
                                    };
                                    for (var i=0; i<locations.length; i++) {
                                        var address = locations[i].get('address');
                                        var ordersByLocation = {};
                                        ordersByLocation[address] = {};
                                        for (var j=0; j<orders.length; j++) {
                                            var pickUpLocation = orders[j].get("pickUpLocation");
                                            var dish = orders[j].get('dishId');
                                            if (orders[j].get("pickUpLocation").id == locations[i].id) {
                                                if (dish.id in ordersByLocation[address]) {
                                                    ordersByLocation[address][dish.id]['quantity'] += orders[j].get('quantity');
                                                    ordersByLocation[address][dish.id]['subTotalPrice'] += orders[j].get('subTotalPrice');
                                                } else {
                                                    ordersByLocation[address][dish.id] = {
                                                        quantity: orders[j].get('quantity'),
                                                        subTotalPrice: orders[j].get('subTotalPrice')
                                                    };
                                                }
                                            }
                                        }
                                        alert(Object.keys(ordersByLocation)[0]);
                                        orderSummary.push(ordersByLocation);
                                    }

                                    alert(JSON.stringify(orderSummary));
                                    self.$el.html(self.template({ordersByLocations: orderSummary}));
                                },
                                error: function(error) {
                                    console.log(error.message);
                                }
                            });
                        },
                        error: function(error) {
                            console.log(error.message);
                        }
                    });
                },
                error: function(error) {
                    console.log(error.message);
                }
            })
        },

        applyQuery: function(query, self) {
            var query = new Parse.Query(PaymentModel);
            query.equalTo("address", "Regents Drive Parking Garage");
            //Create a OrderModel
            self.orderDetails = new OrderModel();
            self.orderDetails.set('comboQuantity1', 0);
            self.orderDetails.set('dishQuantity1', 0);
            self.orderDetails.set('comboQuantity2', 0);
            self.orderDetails.set('dishQuantity2', 0);
            self.orderDetails.set('comboQuantity3', 0);
            self.orderDetails.set('dishQuantity3', 0);
            self.orderDetails.set('final1', 0);
            self.orderDetails.set('final2', 0);
            self.orderDetails.set('final3', 0);


            //Create new attributes
            var totalCombo = 0;
            var totalComboC = 0;
            var totalDish = 0;
            var totalPrice = 0;

            var totalVMCombo = 0;
            var totalVMComboC = 0;
            var totalVMDish = 0;
            var totalVMPrice = 0;

            var totalAVCombo = 0;
            var totalAVComboC = 0;
            var totalAVDish = 0;
            var totalAVPrice = 0;

            //Display the order between a duration
            var current = new Date();
            var currentHour = current.getHours();
            if (currentHour > 14) {
                //After 14:00, display the orders from today 2pm to tomorrow 12pm
                var upperDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                upperDate.setHours(12, 0, 0, 0);
                var lowerDate = current;
                lowerDate.setHours(14, 0, 0, 0);
            }
            else {
                //Before 14:00, display the orders from yesterday 2pm to today 12pm
                upperDate = current;
                upperDate.setHours(12, 0, 0, 0);
                lowerDate = new Date(current.getTime() - 24 * 60 * 60 * 1000);
                lowerDate.setHours(14, 0, 0, 0);
            }

            query.greaterThan("createdAt", lowerDate);
            query.lessThan("createdAt", upperDate);
            query.limit(300);
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var dishName1 = results[i].get('dishName1');
                        var dishName2 = results[i].get('dishName2');
                        var dishName3 = results[i].get('dishName3');
                        var quantity1 = results[i].get('quantity1');
                        var quantity2 = results[i].get('quantity2');
                        var quantity3 = results[i].get('quantity3');
                        var sortedResults = self.assignQuantityProperly(dishName1, dishName2, dishName3, quantity1, quantity2, quantity3, results[i]);

                        totalDish = sortedResults.get('quantity1') + totalDish;
                        totalCombo = sortedResults.get('quantity2') + totalCombo;
                        totalComboC = sortedResults.get('quantity3') + totalComboC;
                        totalPrice = sortedResults.get('totalPrice') + totalPrice;
                    }

                    self.orderDetails.set('dishQuantity1', totalDish);
                    self.orderDetails.set('comboQuantity1', totalCombo);
                    self.orderDetails.set('comboCQuantity1', totalComboC);
                    self.orderDetails.set('final1', totalPrice);
                    self.$el.html(self.template(
                        self.orderDetails.toJSON()
                    ));
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
            query.equalTo("address", "McKeldin Library");
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var dishName1 = results[i].get('dishName1');
                        var dishName2 = results[i].get('dishName2');
                        var dishName3 = results[i].get('dishName3');
                        var quantity1 = results[i].get('quantity1');
                        var quantity2 = results[i].get('quantity2');
                        var quantity3 = results[i].get('quantity3');
                        var sortedResults = self.assignQuantityProperly(dishName1, dishName2, dishName3, quantity1, quantity2, quantity3, results[i]);

                        totalVMDish = sortedResults.get('quantity1') + totalVMDish;
                        totalVMCombo = sortedResults.get('quantity2') + totalVMCombo;
                        totalVMComboC = sortedResults.get('quantity3') + totalVMComboC;
                        totalVMPrice = sortedResults.get('totalPrice') + totalVMPrice;
                    }

                    self.orderDetails.set('dishQuantity2', totalVMDish);
                    self.orderDetails.set('comboQuantity2', totalVMCombo);
                    self.orderDetails.set('comboCQuantity2', totalVMComboC);
                    self.orderDetails.set('final2', totalVMPrice);
                    self.$el.html(self.template(
                        self.orderDetails.toJSON()
                    ));
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
            query.equalTo("address", "AV Williams Bldg");
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var dishName1 = results[i].get('dishName1');
                        var dishName2 = results[i].get('dishName2');
                        var dishName3 = results[i].get('dishName3');
                        var quantity1 = results[i].get('quantity1');
                        var quantity2 = results[i].get('quantity2');
                        var quantity3 = results[i].get('quantity3');
                        var sortedResults = self.assignQuantityProperly(dishName1, dishName2, dishName3, quantity1, quantity2, quantity3, results[i]);

                        totalAVDish = sortedResults.get('quantity1') + totalAVDish;
                        totalAVCombo = sortedResults.get('quantity2') + totalAVCombo;
                        totalAVComboC = sortedResults.get('quantity3') + totalAVComboC;
                        totalAVPrice = sortedResults.get('totalPrice') + totalAVPrice;
                    }

                    self.orderDetails.set('dishQuantity3', totalAVDish);
                    self.orderDetails.set('comboQuantity3', totalAVCombo);
                    self.orderDetails.set('comboCQuantity3', totalAVComboC);
                    self.orderDetails.set('final3', totalAVPrice);
                    self.$el.html(self.template(
                        self.orderDetails.toJSON()
                    ));
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
            //  var finalPrice = self.orderDetails.get('final1') + self.orderDetails.get('final2');
            //  self.orderDetails.set('final', finalPrice);
            //  self.$el.html(self.template(self.orderDetails.toJSON()));
        },

        assignQuantityProperly: function(dishName1, dishName2, dishName3, quantity1, quantity2, quantity3, result) {
            if (dishName3 != undefined) {
                if (dishName2 != undefined) {
                    if (dishName2.indexOf("Combo B") > -1 || dishName2.indexOf("Combo -") > -1) {
                        //Do nothing
                    } else {
                        result.set('quantity1', quantity2);
                        result.set('quantity2', quantity1);
                    }
                } else {
                    if (dishName1.indexOf("Combo B") > -1 || dishName1.indexOf("Combo -") > -1) {
                        result.set('quantity2', quantity1);
                        result.set('quantity1', 0);
                    } else {
                        //Do nothing
                        result.set('quantity2', 0);
                    }
                }
            } else {
                if (dishName2 != undefined) {
                    if (dishName2.indexOf("Combo C") > -1 || dishName2.indexOf("C餐") > -1) {
                        result.set('quantity3', quantity2);
                        if (dishName1.indexOf("Combo B") > -1 || dishName1.indexOf("Combo -") > -1) {
                            result.set('quantity2', quantity1);
                            result.set('quantity1', 0);
                        } else {
                            result.set('quantity2', 0);
                        }
                    } else {
                        result.set('quantity3', 0);
                    }
                } else {
                    if (dishName1.indexOf("Combo C") > -1 || dishName1.indexOf("C餐") > -1) {
                        result.set('quantity3', quantity1);
                        result.set('quantity2', 0);
                        result.set('quantity1', 0);
                    } else if (dishName1.indexOf("Combo B") > -1 || dishName1.indexOf("Combo -") > -1) {
                        result.set('quantity3', 0);
                        result.set('quantity2', quantity1);
                        result.set('quantity1', 0);
                    } else {
                        result.set('quantity3', 0);
                        result.set('quantity2', 0);
                    }
                }
            }

            return result;
        }
    });
    return DeliveryView;
});
