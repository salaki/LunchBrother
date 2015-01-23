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
            paymentQuery.ascending("lname");
            var self = this;
            this.$el.html(this.template());
            this.$("#addressOption").dropdown();
            this.$("#buildingLabel").text("总共");
            this.applyQuery(paymentQuery, self);
        },

        onSearchBarInput: function() {
            var paymentQuery = new Parse.Query(PaymentModel);
            this.$("#addressOption").val("");
            var searchText = this.$("#searchInput").val();
            if (searchText != "") {
                paymentQuery.contains("lname", searchText);
                this.$("#searchResultLabel").text("符合搜寻");
            }
            else {
                this.$("#searchResultLabel").text("");
            }
            paymentQuery.ascending("lname");
            var self = this;
            this.applyQuery(paymentQuery, self);
        },

        onAddressSelect: function() {
            var paymentQuery = new Parse.Query(PaymentModel);
            this.$("#searchResultLabel").text("");
            this.$("#searchInput").val("");
            if (this.$("#addressOption").val() != "all") {
                paymentQuery.contains("address", this.$("#addressOption").val());
            }
            paymentQuery.ascending("lname");
            if (this.$("#addressOption").val() == "RDPG") {
                this.$("#buildingLabel").text("Regents Drive Parking Garage");
            }
            else if (this.$("#addressOption").val() == "VM") {
                this.$("#buildingLabel").text("Van Munching");
            }
            else {
                this.$("#buildingLabel").text("总共");
            }
            var self = this;
            this.applyQuery(paymentQuery, self);
        },

        applyQuery: function(query, self) {
            query.notEqualTo("isPickedUp", true);
            query.limit(200);
            query.find({
                success: function(results) {
                    for (i = 0; i < results.length; i++) {
                        var newEvent = {};
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
            $('.small.test.modal').modal({
                closable: false,
                onDeny: function() {

                },
                onApprove: function() {
                    self.saveChange(orderId);
                    self.$("#div-" + orderId).fadeOut();
                    self.$("#divider-" + orderId).fadeOut();
                    self.$("#orderNumberLabel").text(self.$("#orderNumberLabel").text() - 1);
                }
            }).modal('show');
        },

        saveChange: function(orderId) {
            var paymentDetail = new PaymentModel();
            paymentDetail.id = orderId;
            paymentDetail.set("isPickedUp", true);
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
        },
    });

    return ManageView;

});