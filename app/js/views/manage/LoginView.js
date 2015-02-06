define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'views/manage/DeliveryView',
    'views/manage/ManageView',
    'views/home/HomeView',
    'text!templates/manage/loginTemplate.html'
], function (PaymentModel, OrderModel, DeliveryView, ManageView, HomeView, loginTemplate) {

    var LoginView = Parse.View.extend({
        el: $("#page"),

        orderDetails: {},

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

        continueLogin: function () {
            var self = this;
            var username = this.$("#username").val();
            var password = this.$("#password").val();
            var orderDetails = new OrderModel();
            orderDetails.set('comboQuantity1', 0);
            orderDetails.set('dishQuantity1', 0);
            orderDetails.set('comboQuantity2', 0);
            orderDetails.set('dishQuantity2', 0);
            orderDetails.set('final1', 0);
            orderDetails.set('final2', 0);


            var current = new Date();
            var currentHour = current.getHours();

            if (currentHour > 14) {
                //After 14:00, display the orders from today 2pm to tomorrow 12pm
                var upperDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                upperDate.setHours(12, 0, 0, 0);
                var lowerDate = current;
                lowerDate.setHours(14, 0, 0, 0);
            } else {
                //Before 14:00, display the orders from yesterday 2pm to today 12pm
                var upperDate = current;
                upperDate.setHours(12, 0, 0, 0);
                var lowerDate = new Date(current.getTime() - 24 * 60 * 60 * 1000);
                lowerDate.setHours(14, 0, 0, 0);
            }

            var query = new Parse.Query(PaymentModel);

            var totalCombo = 0;
            var totalDish = 0;
            var totalPrice = 0;

            query.greaterThan("createdAt", lowerDate);
            query.lessThan("createdAt", upperDate);
            query.limit(300);
            query.equalTo("address", "Regents Drive Parking Garage");
            query.find({
                success: function (results) {
                    for (i = 0; i < results.length; i++) {
                        var newEvent = {};
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


                    orderDetails.set('comboQuantity1', totalCombo);
                    orderDetails.set('dishQuantity1', totalDish);
                    orderDetails.set('final1', totalPrice);
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });



            var totalVMCombo = 0;
            var totalVMDish = 0;
            var totalVMPrice = 0;

            query.equalTo("address", "McKeldin Library");


            query.find({
                success: function (results) {
                    for (i = 0; i < results.length; i++) {
                        var newEvent = {};
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


                    orderDetails.set('comboQuantity2', totalVMCombo);
                    orderDetails.set('dishQuantity2', totalVMDish);
                    orderDetails.set('final2', totalVMPrice);
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });

            Parse.User.logIn(username, password, {
                //lunchbrother:manage
                //chef:delivery
                //getcurrentuser's permission
                success: function (user) {
                    var permission = user.get('permission');

                    if (permission == 1) {
                        var homeView = new HomeView();
                        $("#reminder,#loginInfo").remove();
                        $("#page").append(homeView.render().el);
                    }

                    if (permission == 3) {
                        var manageView = new ManageView();
                        $("#reminder,#loginInfo").remove();
                        $("#page").append(manageView.render().el);
                    }

                    if (permission == 2) {
                        var deliveryView = new DeliveryView({
                            model: orderDetails
                        });
                        $("#reminder,#loginInfo").remove();
                        $("#page").append(deliveryView.render().el);
                    }
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
