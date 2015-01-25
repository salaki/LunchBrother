define([
  'models/order/PaymentModel',
  'models/order/OrderModel',
  'views/manage/DeliveryView',
  'text!templates/manage/loginTemplate.html'
], function (PaymentModel, OrderModel, DeliveryView, loginTemplate) {

    var LoginView = Parse.View.extend({
        el: $("#page"),

        events: {
            'submit #loginForm': 'continueLogin'
        },

        initialize: function () {
            _.bindAll(this, 'render', 'continueLogin');
        },

        template: _.template(loginTemplate),

        render: function () {
            this.$el.html(this.template());
            this.$('.ui.form').form({
                'username': {
                    identifier: 'username',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please enter your username'
                    }]
                },
                'password': {
                    identifier: 'password',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please enter your password'
                    }]
                }
            }, {
                on: 'blur',
                inline: 'true'
            });
            return this;
        },

        continueLogin: function (e) {
            var self = this;
            var username = this.$("#username").val();
            var password = this.$("#password").val();
            //yesterday:8pm to today's 11am
            var found = "Combo";
            var totalDishQuantity1 = 0;
            var totalComboQuantity1 = 0;
            var totalDishQuantity2 = 0;
            var totalComboQuantity2 = 0;
            var totalPrice1 = 0;
            var totalPrice2 = 0;
            var orderDetails = new OrderModel();
            orderDetails.set('comboQuantity1', 0);
            orderDetails.set('dishQuantity1', 0);
            orderDetails.set('comboQuantity2', 0);
            orderDetails.set('dishQuantity2', 0);
            var today = new Date();
            today.setHours(11, 0, 0, 0);
            var yesterday = new Date();
            yesterday.setHours(20, 0, 0, 0);
            yesterday.setDate(yesterday.getDate() - 1);
            var tdQuery = new Parse.Query(PaymentModel);
            tdQuery.greaterThanOrEqualTo("createdAt", yesterday);
            tdQuery.lessThanOrEqualTo("createdAt", today);
            var tdRDPGQuery = tdQuery.equalTo("address", "Regents Drive Parking Garage");
            var tdVMQuery = tdQuery.equalTo("address", "Van Munching");
            tdRDPGQuery.find({
                success: function (results) {
                    _.each(results, function (result) {
                        var dish1 = result.get("dishname1");
                        var dish2 = result.get("dishName2");
                        totalPrice1 += result.get("totalPrice");
                        orderDetails.set("final1", totalPrice1);
                        if (dish2 !== undefined) {
                            //order two dishes
                            totalDishQuantity1 += result.get("quantity1");
                            totalComboQuantity1 += result.get("quantity2");
                            orderDetails.set("dishQuantity1", totalDishQuantity1);
                            orderDetails.set("comboQuantity1", totalComboQuantity1);
                        }
                        if (dish2 == undefined) {
                            if (dish1.match(found)) {
                                totalComboQuantity1 += result.get("quantity1");
                                orderDetails.set('comboQuantity1', totalComboQuantity1);
                            }
                            if (!dish1.match(found)) {
                                totalDishQuantity1 += result.get("quantity1");
                                orderDetails.set('dishQuantity1', totalDishQuantity1);
                            }
                        }
                    });
                },
                error: function (error) {

                }
            });

            tdVMQuery.find({
                success: function (results) {
                    _.each(results, function (result) {
                        var dish1 = result.get("dishname1");
                        var dish2 = result.get("dishName2");
                        totalPrice2 += result.get("totalPrice");
                        orderDetails.set("final2", totalPrice2);
                        if (dish2 !== undefined) {
                            //order two dishes
                            totalDishQuantity2 += result.get("quantity1");
                            totalComboQuantity2 += result.get("quantity2");
                            orderDetails.set("dishQuantity2", totalDishQuantity2);
                            orderDetails.set("comboQuantity2", totalComboQuantity2);
                        }
                        if (dish2 == undefined) {
                            if (dish1.match(found)) {
                                totalComboQuantity2 += result.get("quantity1");
                                orderDetails.set('comboQuantity2', totalComboQuantity2);
                            }
                            if (!dish1.match(found)) {
                                totalDishQuantity2 += result.get("quantity1");
                                orderDetails.set('dishQuantity2', totalDishQuantity2);
                            }
                        }
                    });
                },
                error: function (error) {

                }
            });


            Parse.User.logIn(username, password, {
                success: function (user) {
                    var view = new DeliveryView({
                        model: orderDetails
                    });
                    $("#reminder,#loginInfo").remove();
                    $("#page").append(view.render().el);
                },
                error: function (user, error) {
                    self.$("#loginInfo .error").html("Invalid username or password. Please try again.").show();
                    self.$("#loginForm button").removeAttr("disabled");
                }
            });
            var $form = this.$('form');
            $form.find('#loginBtn').prop('disabled', true);
            return false;
        }
    });
    return LoginView;
});
