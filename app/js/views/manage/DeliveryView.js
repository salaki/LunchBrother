define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'views/manage/LoginView',
    'text!templates/manage/deliveryTemplate.html'
], function(PaymentModel, OrderModel, LoginView, deliveryTemplate) {

    var DeliveryView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                currentUser.fetch();
                $("#userEmail").text(currentUser.get('email'));
                $("#userPhone").text(currentUser.get('telnum'));
                $("#userFullName").text(currentUser.get('firstName') + " " + currentUser.get('lastName'));
                $("#userCreditBalance").text(currentUser.get('creditBalance').toFixed(2));
                $("#accountBarFirstName").text(currentUser.get('firstName'));
            }
            $('#account').show();
        },

        template: _.template(deliveryTemplate),

        render: function() {
            var query = new Parse.Query(PaymentModel);
            var self = this;
            this.applyQuery(query, self);
            return this;
        },

        applyQuery: function(query, self) {
            query.equalTo("address", "Regents Drive Parking Garage");
            //Create a OrderModel
            self.orderDetails = new OrderModel();
            self.orderDetails.set('comboQuantity1', 0);
            self.orderDetails.set('dishQuantity1', 0);
            self.orderDetails.set('comboQuantity2', 0);
            self.orderDetails.set('dishQuantity2', 0);
            self.orderDetails.set('final1', 0);
            self.orderDetails.set('final2', 0);


            //Create new attributes
            var totalCombo = 0;
            var totalDish = 0;
            var totalPrice = 0;

            var totalVMCombo = 0;
            var totalVMDish = 0;
            var totalVMPrice = 0;

            //Display the order between a durantion
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
                        var quantity1 = results[i].get('quantity1');
                        var quantity2 = results[i].get('quantity2');
                        if (dishName2 != undefined) {
                            if (dishName2.indexOf("Combo") > -1) {
                                //Do nothing
                            }
                            else {
                                results[i].set('quantity1', quantity2);
                                results[i].set('quantity2', quantity1);
                            }
                        }
                        else {
                            if (dishName1.indexOf("Combo") > -1) {
                                results[i].set('quantity2', quantity1);
                                results[i].set('quantity1', 0);
                            }
                            else {
                                //Do nothing
                                results[i].set('quantity2', 0);
                            }
                        }
                        totalDish = results[i].get('quantity1') + totalDish;
                        totalCombo = results[i].get('quantity2') + totalCombo;
                        totalPrice = results[i].get('totalPrice') + totalPrice;
                    }

                    self.orderDetails.set('comboQuantity1', totalCombo);
                    self.orderDetails.set('dishQuantity1', totalDish);
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
                        var quantity1 = results[i].get('quantity1');
                        var quantity2 = results[i].get('quantity2');
                        if (dishName2 != undefined) {
                            if (dishName2.indexOf("Combo") > -1) {
                                //Do nothing
                            }
                            else {
                                results[i].set('quantity1', quantity2);
                                results[i].set('quantity2', quantity1);
                            }
                        }
                        else {
                            if (dishName1.indexOf("Combo") > -1) {
                                results[i].set('quantity2', quantity1);
                                results[i].set('quantity1', 0);
                            }
                            else {
                                //Do nothing
                                results[i].set('quantity2', 0);
                            }
                        }

                        totalVMDish = results[i].get('quantity1') + totalVMDish;
                        totalVMCombo = results[i].get('quantity2') + totalVMCombo;
                        totalVMPrice = results[i].get('totalPrice') + totalVMPrice;
                    }


                    self.orderDetails.set('comboQuantity2', totalVMCombo);
                    self.orderDetails.set('dishQuantity2', totalVMDish);
                    self.orderDetails.set('final2', totalVMPrice);
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
        }
    });
    return DeliveryView;
});