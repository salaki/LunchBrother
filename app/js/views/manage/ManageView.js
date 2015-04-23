define([
    'views/status/StatusView',
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'models/dish/DishModel',
    'models/Grid',
    'models/PickUpLocation',
    'models/order/NotificationModel',
    'models/manage/DeliveryModel',
    'text!templates/manage/manageTemplate.html',
    'text!templates/manage/orderListTemplate.html',
    'i18n!nls/manage',
    'libs/semantic/dropdown.min'
], function (StatusView, PaymentModel, OrderModel, DishModel, GridModel, PickUpLocationModel, NotificationModel, DeliveryModel, manageTemplate, orderListTemplate, manageLocal) {
    var ManageView = Parse.View.extend({
        el: $("#page"),
        template: _.template(manageTemplate),
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

        render: function () {
//            var pickUpLocations = config.pickUpLocations.UMCP;
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
                    self.$("#arriveBtn").text(manageLocal.arrived);
                    self.$("#arriveBtn").addClass("red");
                    $("#manageTitle").text(manageLocal.manageTitle);
                    $("#has").text(manageLocal.hasPhrase);
                    $("#numberOrder").text(manageLocal.numberOrder);
//                    $("#manageRemark").text(manageLocal.manageRemark);
                },
                error: function(error) {
                    alert("Pick Up Location Query Error: " + error.code + " " + error.message);
                }
            });

            return self;
        },

        onSearchBarInput: function () {
            var paymentQuery = new Parse.Query(PaymentModel);
            var searchText = this.$("#searchInput").val().toLowerCase();
            if (searchText != "") {
                paymentQuery.contains("lowercaseLastName", searchText);
                this.$("#searchResultLabel").text(manageLocal.searchResultLabel);
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
                    alert("Payment Query Error: " + error.code + " " + error.message);
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
                    self.populateManageView(payments, orders);
                },
                error: function (error) {
                    alert("Order Query Error: " + error.code + " " + error.message);
                }
            });
        },

        populateManageView: function(payments, orders) {
            var self = this;
            var currentUser = Parse.User.current();
            var newResults = [];
            var newEvent = {};
            _.each(payments, function(payment) {
                if (payment.get("pickUpLocation") !== undefined) {
                    var paymentGridId = "nmbyDzTp7m";  //For old user backward compatibility
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
                                paymentDetailMap.orderSummary += order.get("dishId").get("type") + ":" + order.get("quantity") + ", ";
                            }
                        });
                        paymentDetailMap.orderSummary = paymentDetailMap.orderSummary.substring(0, paymentDetailMap.orderSummary.length - 2);
//                        alert(paymentDetailMap.orderSummary);
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
            $(".orderListOrderNumber").text(manageLocal.manageOrderNumber);
            $(".orderListTotal").text(manageLocal.manageTotal);
        },

        onPickupClick: function (ev) {
            var self = this;
            var orderId = $(ev.currentTarget).data('order');
            var name = $(ev.currentTarget).data('lname') + ", " + $(ev.currentTarget).data('fname');
            var totalPrice = $(ev.currentTarget).data('price');
            $("#confirmDialogPay").text(totalPrice);
            $("#confirmDialogOrderId").text(orderId);
            $("#confirmDialogName").text(name);
            $("#manageCustomer").text(manageLocal.manageCustomer);
            $("#manageOrderNumber").text(manageLocal.manageOrderNumber);
            $("#manageTotal").text(manageLocal.manageTotal);
            $("#manageConfirmTitle").text(manageLocal.manageConfirmTitle);
            $("#manageCancel").text(manageLocal.manageCancel);
            $("#manageConfirm").text(manageLocal.manageConfirm);
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
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        },

        updateStatus: function () {
            var self = this;
            self.deliveryDetails = new DeliveryModel();
            self.deliveryDetails.set("status", manageLocal.onTheWay);
            self.deliveryDetails.set("address", this.$("#addressOption").val());
            self.deliveryDetails.save();
            self.checkIfNotificationSent(this.$("#addressOption").val());
        },

        sendNotification: function() {
            var query = new Parse.Query(PaymentModel);
            query.equalTo("address", this.$("#addressOption").val());
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
                        pickupAddress: address,
                        ordersToSend: orders
                    }, {
                        success: function () {
                            console.log("Arrival notification has been sent successfully!");
                            var notification = new NotificationModel();
                            notification.set("key", this.getNotificationKey(address));
                            notification.save({
                                success: function(notification) {
                                    console.log("Notification saved successfully!");
                                },
                                error: function(error) {
                                    console.log("Notification saved failed! Reason: " + error.message);
                                }
                            });
                        },
                        error: function (error) {
                            console.log("Notification failed to send. Error: " + error.message);
                        }
                    });
                },
                error: function (error) {
                    console.log("Error: " + error.code + " " + error.message);
                }
            });
        },

        checkIfNotificationSent: function() {
            var notificationQuery = new Parse.Query(NotificationModel);
            notificationQuery.equalTo("key", this.getNotificationKey());
            notificationQuery.find({
                success: function (results) {
                    if(results.length > 0){
                        console.log("Notification email has already been sent before!");
                    }else{
                        this.sendNotification();
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

    return ManageView;

});
