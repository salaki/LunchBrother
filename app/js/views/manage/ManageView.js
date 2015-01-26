define([
    'views/status/StatusView',
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'models/manage/DeliveryModel',
    'text!templates/manage/manageTemplate.html',
    'text!templates/manage/orderListTemplate.html',
    'libs/semantic/dropdown.min'
], function(StatusView, PaymentModel, OrderModel, DeliveryModel, manageTemplate, orderListTemplate) {
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

        initialize: function() {
            _.bindAll(this, 'render', 'updateStatus');
        },

        render: function() {
            $('.menu li').removeClass('active');
            $('.menu li a[href="#"]').parent().addClass('active');
            var paymentQuery = new Parse.Query(PaymentModel);
            var self = this;
            this.$el.html(this.template());
            this.$("#addressOption").dropdown();
            this.applyQuery(paymentQuery, self);
        },

        onSearchBarInput: function() {
            var paymentQuery = new Parse.Query(PaymentModel);
            var searchText = this.$("#searchInput").val().toLowerCase();
            if (searchText != "") {
                paymentQuery.contains("lowercaseLastName", searchText);
                this.$("#searchResultLabel").text("符合搜寻");
            }
            else {
                this.$("#searchResultLabel").text("");
            }
            var self = this;
            this.applyQuery(paymentQuery, self);
        },

        onAddressSelect: function() {
            var paymentQuery = new Parse.Query(PaymentModel);
            var self = this;
            this.applyQuery(paymentQuery, self);
        },

        applyQuery: function(query, self) {
            this.$("#buildingLabel").text(this.$("#addressOption").val());
            query.contains("lowercaseLastName", this.$("#searchInput").val().toLowerCase());
            query.equalTo("address", this.$("#addressOption").val());
            query.ascending("lowercaseLastName");
            query.equalTo("paymentCheck", true);
            query.notEqualTo("isPickedUp", true);

            //Display the orders which are from yesterday 2pm to today 12pm
            var lowerDate = new Date(new Date().getTime() - 24*60*60*1000);
            lowerDate.setHours(14, 0, 0, 0);
            var upperDate = new Date();
            upperDate.setHours(12, 0, 0, 0);

            query.greaterThan("createdAt", lowerDate);
            query.lessThan("createdAt", upperDate);
            query.limit(300);
            query.find({
                success: function(results) {
                    for (i = 0; i < results.length; i++) {
                        var newEvent = {};
                        var dishName1 = results[i].get('dishName1');
                        var dishName2 = results[i].get('dishName2');
                        var quantity1 = results[i].get('quantity1');
                        var quantity2 = results[i].get('quantity2');
                        if (dishName2 != undefined) {
                            if (dishName2.indexOf("Combo") > -1) {
                                //Do nothing
                            } else {
                                results[i].set('quantity1', quantity2);
                                results[i].set('quantity2', quantity1);
                            }
                        } else {
                            if (dishName1.indexOf("Combo") > -1) {
                                results[i].set('quantity2', quantity1);
                                results[i].set('quantity1', 0);
                            } else {
                                //Do nothing
                                results[i].set('quantity2', 0);
                            }
                        }
                        newEvent["click #checkButton-" + results[i].id] = 'onPickupClick';
                        self.delegateEvents(_.extend(self.events, newEvent));
                    }
                    self.$("#orderNumberLabel").text(results.length);
                    self.$("#orderList").html(self.orderListTemplate({
                        orders: results
                    }));
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        },

        onPickupClick: function(ev) {
            var self = this;
            var orderId = $(ev.currentTarget).data('order');
            var name = $(ev.currentTarget).data('lname') + ", " + $(ev.currentTarget).data('fname');
            var totalPrice = $(ev.currentTarget).data('price');
            $("#confirmDialogPay").text(totalPrice);
            $("#confirmDialogOrderId").text(orderId);
            $("#confirmDialogName").text(name);
            $('#confirmDeliveryPayment').modal({
                closable  : false,
                onDeny    : function(){

                },
                onApprove : function() {
                    self.saveChange(orderId, "isPickedUp", true);
                    self.$("#div-" + orderId).fadeOut();
                    self.$("#divider-" + orderId).fadeOut();
                    self.$("#orderNumberLabel").text(self.$("#orderNumberLabel").text() - 1);
                }
            }).modal('show');
        },

        saveChange: function(orderId, attributeName, attributeValue) {
            var paymentDetail = new PaymentModel();
            paymentDetail.id = orderId;
            paymentDetail.set(attributeName, attributeValue);
            paymentDetail.save(null, {
                success: function(paymentDetail) {
                    //Do nothing
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        },
        
        //click->save status->retrieve status -> display on the button:text
        updateStatus: function() {
            var deliveryDetails = new DeliveryModel({});
            if ($("#addressOption").val() == "RDPG") {
                deliveryDetails.set('status1', "我已到达!");
                deliveryDetails.save();
            }
            if ($("#addressOption").val() == "VM") {
                deliveryDetails.set('status2', "我已到达!");
                deliveryDetails.save();
            }
            if ($("#arriveBtn").val() == "我已到达!" && $("#addressOption").val() == "RDPG") {
                deliveryDetails.set('status1', "正在路上...");
                deliveryDetails.save();
            }
            if ($("#arriveBtn").val() == "我已到达!" && $("#addressOption").val() == "VM") {
                deliveryDetails.set('status2', "正在路上...");
                deliveryDetails.save();
            }
            
            var statusQuery = new Parse.Query(DeliveryModel);
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var tomorrow = new Date();
            tomorrow.setHours(0, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate() + 1);
            statusQuery.greaterThanOrEqualTo("createdAt", today);
            statusQuery.lessThanOrEqualTo("createdAt", tomorrow);
            statusQuery.descending("createdAt");
            statusQuery.find({
                success: function(results) {
                    _.each(results,function(result){
                        var status1 = result.get('status1');
                        var status2 = result.get('status2');
                        if (status1 === "我已到达!") {
                            if ($("#addressOption").val() === "RDPG") {
                                $("#arriveBtn").text("我已到达!");
                                $("#arriveBtn").addClass("red");
                            }
                        }
                        if (status2 === "我已到达!") {
                            if ($("#addressOption").val() == "VM") {
                                $("#arriveBtn").text("我已到达!");
                                $("#arriveBtn").addClass("red");
                            }
                        }
                    });
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        }
    });

    return ManageView;

});
