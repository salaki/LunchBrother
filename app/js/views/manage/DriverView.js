define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'models/dish/DishModel',
    'models/Grid',
    'models/Restaurant',
    'models/PickUpLocation',
    'views/manage/LoginView',
    'text!templates/manage/driverTemplate.html'
], function(PaymentModel, OrderModel, DishModel, GridModel, RestaurantModel, PickUpLocationModel, LoginView, driverTemplate) {

    var DriverView = Parse.View.extend({
        el: $("#page"),

        initialize: function() {
            _.bindAll(this, 'render');
        },

        template: _.template(driverTemplate),

        render: function() {
            var self = this;
            this.applyQuery2(self);
            return this;
        },

        applyQuery2: function(self) {
            var pickUpSummary = {};
            var dishQuantityMap = {};
            var orderQuery = new Parse.Query(OrderModel);
            var chefGrid = Parse.User.current().get('gridId');
            //default chef's grid to University of Maryland College Park
            if (chefGrid == undefined){
                chefGrid = new GridModel();
                chefGrid.id = UMCP_GRID_ID;
            }
            var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
            pickUpLocationQuery.equalTo("gridId", chefGrid);
            pickUpLocationQuery.find({
                success: function(locations) {
                    var locationArray = [];
                    var locationNames = [];
                    for (var i=0; i<locations.length; i++) {
                        locationNames.push(locations[i].get('address'));
                        locationArray.push(locations[i]);
                    }

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

                    orderQuery.greaterThan("createdAt", lowerDate);
                    orderQuery.lessThan("createdAt", upperDate);
                    orderQuery.containedIn("pickUpLocation", locationArray);
                    orderQuery.include("dishId");
                    orderQuery.include("restaurantId");
                    orderQuery.find({
                        success: function(orders) {
                            var ordersByLocations = [];
                            for (var i=0; i<locationNames.length; i++) {
                                var address = locationNames[i];
                                var orderDetailMap = {};
                                orderDetailMap["dishNames"] = [];
                                orderDetailMap["dishTypes"] = [];
                                orderDetailMap["quantity"] = [];
                                orderDetailMap["subTotalPrice"] = [];
                                for (var j=0; j<orders.length; j++) {
                                    if (!('restaurantName' in pickUpSummary)) {
                                        pickUpSummary['restaurantName'] = orders[j].get('restaurantId').get('name');
                                    }

                                    if (!('restaurantNumber' in pickUpSummary)) {
                                        pickUpSummary['restaurantNumber'] = orders[j].get('restaurantId').get('telnum');
                                    }

                                    if (!('restaurantAddress' in pickUpSummary)) {
                                        pickUpSummary['restaurantAddress'] = orders[j].get('restaurantId').get('address');
                                    }

                                    var pickUpLocation = orders[j].get("pickUpLocation");
                                    var dish = orders[j].get('dishId');

                                    if (orders[j].get("pickUpLocation").id == locations[i].id) {
                                        var index = orderDetailMap["dishNames"].indexOf(dish.id);
                                        if (index > 0) {
                                            orderDetailMap["quantity"][index] += orders[j].get('quantity');
                                            orderDetailMap["subTotalPrice"][index] += orders[j].get('subTotalPrice');
                                        } else {
                                            orderDetailMap["dishNames"].push(dish.id);
                                            orderDetailMap["dishTypes"].push(dish.get('typeEn'));
                                            orderDetailMap["quantity"].push(orders[j].get('quantity'));
                                            orderDetailMap["subTotalPrice"].push(orders[j].get('subTotalPrice'));
                                        }

                                        if (dish.id in dishQuantityMap) {
                                            dishQuantityMap[dish.id]['dishQuantity'] += orders[j].get('quantity');
                                        } else {
                                            dishQuantityMap[dish.id] = {
                                                dishName: dish.get('typeEn'),
                                                dishQuantity: orders[j].get('quantity')
                                            }
                                        }
                                    }
                                }


                                var dishQuantityString = "";
                                _.each(dishQuantityMap, function(object) {
                                    var tempString = object['dishName'] + " - " + object['dishQuantity'] + ", ";
                                    dishQuantityString += tempString
                                });

                                var length = dishQuantityString.length;
                                dishQuantityString = dishQuantityString.substring(0, length-2);
                                pickUpSummary['dishQuantity'] = dishQuantityString;


                                var orderDetailZip = _.zip(orderDetailMap["dishTypes"], orderDetailMap["quantity"], orderDetailMap["subTotalPrice"]);
                                ordersByLocations.push(orderDetailZip);
                            }

//                            console.log(ordersByLocations);
//                            console.log(locationNames);
//                                    self.$el.html(self.template({ordersByLocations: orderSummary}));
                            var zipped = _.zip(locationNames, ordersByLocations);
//                                    self.$el.html(self.template({locationNames: locationNames, ordersByLocations: ordersByLocations}));
                            self.$el.html(self.template({ordersByLocations: zipped}));

                            self.$("#resName").html(pickUpSummary['restaurantName']);
                            self.$("#resNumber").html(pickUpSummary['restaurantNumber']);
                            self.$("#resAddress").html(pickUpSummary['restaurantAddress']);
                            self.$("#dishQuan").html(pickUpSummary['dishQuantity']);
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
        }
    });
    return DriverView;
});
