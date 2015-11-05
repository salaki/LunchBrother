define([
    'views/status/StatusView',
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'models/dish/DishModel',
    'models/Grid',
    'models/PickUpLocation',
    'models/order/NotificationModel',
    'models/manage/DeliveryModel',
    'text!templates/manage/distributorTemplate.html',
    'text!templates/manage/orderListTemplate.html',
    'libs/semantic/dropdown.min'
], function (StatusView, PaymentModel, OrderModel, DishModel, GridModel, PickUpLocationModel, NotificationModel, DeliveryModel, distributorTemplate, orderListTemplate) {
    var DistributorView = Parse.View.extend({
        el: $("#page"),
        template: _.template(distributorTemplate),
        orderListTemplate: _.template(orderListTemplate),
        events: {
            //view listenTo model change
            'keyup  #searchInput': 'onSearchBarInput',
            'change #addressOption': 'onAddressSelect',
            'click  #arriveBtn': 'updateStatus'
        },

        initialize: function () {
            _.bindAll(this, 'render', 'updateStatus');
            var currentUser = Parse.User.current();
        },

        render: function () {
            var self = this;
            var currentUser = Parse.User.current();
            var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
            pickUpLocationQuery.equalTo("gridId", currentUser.get("gridId"));
            pickUpLocationQuery.find({
                success: function(pickUpLocations) {
                    self.$el.html(self.template({pickUpLocations: pickUpLocations}));
                    $('.menu li').removeClass('active');
                    $('.menu li a[href="#"]').parent().addClass('active');
                    var paymentQuery = new Parse.Query(PaymentModel);
                    self.$("#addressOption").dropdown();
                    self.applyQuery(paymentQuery, self);
                    self.$("#arriveBtn").addClass("red");

                    var current = new Date();
                    if (current.getHours() < 11 || current.getHours() > 14) {
                        self.$("#arriveBtn").addClass("disabled");
                    }
                },
                error: function(error) {
                    showMessage("Error", "Pick Up Location Query Error: " + error.code + " " + error.message);
                }
            });

            return self;
        },

        onSearchBarInput: function () {
            var paymentQuery = new Parse.Query(PaymentModel);
            var searchText = this.$("#searchInput").val().toLowerCase();
            if (searchText != "") {
                paymentQuery.contains("lowercaseLastName", searchText);
            }
            else {
                this.$("#searchResultLabel").text("");
            }
            var self = this;
            this.applyQuery(paymentQuery, self);
        },

        onAddressSelect: function () {
            var paymentQuery = new Parse.Query(PaymentModel);
            var self = this;
            this.applyQuery(paymentQuery, self);
        },

        applyQuery: function (query, self) {
            this.$("#buildingLabel").text(this.$("#addressOption option:selected").text());
            query.contains("lowercaseLastName", this.$("#searchInput").val().toLowerCase());
            query.ascending("lowercaseLastName");
            query.equalTo("paymentCheck", true);
            query.notEqualTo("isPickedUp", true);
            query.include("pickUpLocation");

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
                success: function (payments) {
                    self.queryOrder(payments);
                },
                error: function (error) {
                    showMessage("Error", "Payment Query Error: " + error.code + " " + error.message);
                }
            });
        },

        queryOrder: function(payments) {
            var self = this;
            var orderQuery = new Parse.Query(OrderModel);
            orderQuery.include("dishId");
            orderQuery.include("restaurantId");
            orderQuery.find({
                success: function (orders) {
                    self.populateDistributorView(payments, orders);
                },
                error: function (error) {
                    showMessage("Error", "Order Query Error: " + error.code + " " + error.message);
                }
            });
        },

        populateDistributorView: function(payments, orders) {
            var self = this;
            var currentUser = Parse.User.current();
            var newResults = [];
            var newEvent = {};
            _.each(payments, function(payment) {
                if (payment.get("pickUpLocation") !== undefined) {
                    var paymentGridId = UMCP_GRID_ID;  //For old user backward compatibility
                    if (payment.get("pickUpLocation") !== undefined) {
                        paymentGridId = payment.get("pickUpLocation").get("gridId").id;
                    }

                    var paymentDetailMap = {
                        firstName: payment.get('fname'),
                        lastName: payment.get('lname'),
                        telNum: payment.get('telnum'),
                        totalPrice: payment.get('totalPrice'),
                        orderNumber: payment.id,
                        orderSummary: ""
                    };

                    if (paymentGridId === currentUser.get("gridId").id && payment.get("pickUpLocation").id === self.$("#addressOption").val()) {
                        _.each(orders, function(order){
                            if (order.get("paymentId") !== undefined && order.get("paymentId").id === payment.id) {
                                paymentDetailMap.orderSummary += order.get("dishId").get("dishName") + ":" + order.get("quantity") + ", ";
                            }
                        });
                        paymentDetailMap.orderSummary = paymentDetailMap.orderSummary.substring(0, paymentDetailMap.orderSummary.length - 2);
                        newResults.push(paymentDetailMap);
                        newEvent["click #checkButton-" + paymentDetailMap.orderNumber] = 'onPickupClick';
                        self.delegateEvents(_.extend(self.events, newEvent));
                    }
                }
            });
            self.$("#orderNumberLabel").text(newResults.length);
            self.$("#orderList").html(self.orderListTemplate({
                payments: newResults
            }));
        },

        onPickupClick: function (ev) {
            var self = this;
            var orderId = $(ev.currentTarget).data('order');
            var name = $(ev.currentTarget).data('lname') + ", " + $(ev.currentTarget).data('fname');
            var totalPrice = $(ev.currentTarget).data('price');
            $("#confirmDialogPay").text(totalPrice);
            $("#confirmDialogOrderId").text(orderId);
            $("#confirmDialogName").text(name);
            $('#confirmDeliveryPayment').modal({
                closable: false,
                onDeny: function () {

                },
                onApprove: function () {
                    self.saveChange(orderId, "isPickedUp", true);
                    self.$("#div-" + orderId).fadeOut();
                    self.$("#divider-" + orderId).fadeOut();
                    self.$("#orderNumberLabel").text(self.$("#orderNumberLabel").text() - 1);
                }
            }).modal('show');
        },

        saveChange: function (orderId, attributeName, attributeValue) {
            var paymentDetail = new PaymentModel();
            paymentDetail.id = orderId;
            paymentDetail.set(attributeName, attributeValue);
            paymentDetail.save(null, {
                success: function (paymentDetail) {
                    //Do nothing
                },
                error: function (error) {
                    showMessage("Error", "Save payment failed! Reason: " + error.message);
                }
            });
        },

        updateStatus: function () {
            this.$("#arriveBtn").addClass("disabled");
            //var deliveryDetails = new DeliveryModel();
            //deliveryDetails.set("status", "Arrived!");
            //deliveryDetails.set("address", this.$("#addressOption").val());
            //deliveryDetails.save();
            this.checkIfNotificationSent(this.$("#addressOption").val());
        },

        sendNotification: function() {
            var self = this;
            var query = new Parse.Query(PaymentModel);
            var pickUpLocationId = this.$("#addressOption").val();
            query.equalTo("pickUpLocation", {
                __type: "Pointer",
                className: "PickUpLocation",
                objectId: pickUpLocationId
            });
            query.equalTo("paymentCheck", true);
            query.notEqualTo("isPickedUp", true);

            //Display the orders which are from yesterday 2pm to today 12pm
            var lowerDate = new Date(new Date().getTime() - 24*60*60*1000);
            lowerDate.setHours(14, 0, 0, 0);
            var upperDate = new Date();
            upperDate.setHours(12, 0, 0, 0);

            var orders = [];
            query.greaterThan("createdAt", lowerDate);
            query.lessThan("createdAt", upperDate);
            query.limit(300);
            query.find({
                success: function (results) {
                    for (var i=0; i<results.length; i++) {
                        orders[i] = results[i].get('fname') + ",";
                        orders[i] += results[i].get('lname') + ",";
                        orders[i] += results[i].get('email');
                    }

                    Parse.Cloud.run('emailNotification', {
                        pickUpLocationId: pickUpLocationId,
                        ordersToSend: orders
                    }, {
                        success: function () {
                            showMessage("Success", "Arrival notification has been sent to customers successfully!", function(){
                                var notification = new NotificationModel();
                                notification.set("key", self.getNotificationKey(pickUpLocationId));
                                notification.save({
                                    success: function(notification) {
                                        console.log("Notification saved successfully!");
                                    },
                                    error: function(error) {
                                        console.log("Notification saved failed! Reason: " + error.message);
                                    }
                                });
                            });
                        },
                        error: function (error) {
                            showMessage("Failed", "Notification failed to send. Error: " + error.message);
                        }
                    });
                },
                error: function (error) {
                    console.log("Error: " + error.code + " " + error.message);
                }
            });
        },

        checkIfNotificationSent: function() {
            var self = this;
            var notificationQuery = new Parse.Query(NotificationModel);
            notificationQuery.equalTo("key", self.getNotificationKey());
            notificationQuery.find({
                success: function (results) {
                    if(results.length > 0){
                        showMessage("Oops!", "Notification has already been sent before!");
                    }else{
                        self.sendNotification();
                    }
                },
                error: function (error) {
                    console.log("Error: " + error.code + " " + error.message);
                }
            });
        },

        getNotificationKey: function() {
            var date = new Date().getDate();
            var month = new Date().getMonth() + 1;
            var year = new Date().getFullYear();
            var key = this.$("#addressOption").val() + "-" + year + month + date;
            return key;
        }
    });

    return DistributorView;

});
