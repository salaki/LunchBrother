define([
  'models/order/PaymentModel',
  'models/order/OrderModel',
  'views/manage/DeliveryView',
  'views/manage/ManageView',
  'text!templates/manage/loginTemplate.html'
], function (PaymentModel, OrderModel, DeliveryView, ManageView, loginTemplate) {

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

        continueLogin: function (e) {
            var self = this;
            var username = this.$("#username").val();
            var password = this.$("#password").val();
            //yesterday:8pm to today's 11am
            var found = "Combo";
            var orderDetails = new OrderModel();
            orderDetails.set('comboQuantity1', 0);
            orderDetails.set('dishQuantity1', 0);
            orderDetails.set('comboQuantity2', 0);
            orderDetails.set('dishQuantity2', 0);
            var today = new Date();
            var currentHour = today.getHours();
            if (currentHour > 12) {
                var upperDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                upperDate.setHours(12, 0, 0, 0);
                var lowerDate = today;
                lowerDate.setHours(20, 0, 0, 0);
            } else {
                upperDate = today;
                upperDate.setHours(12, 0, 0, 0);
                lowerDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                lowerDate.setHours(20, 0, 0, 0);
            }

            var tdQuery = new Parse.Query(PaymentModel);
            tdQuery.greaterThanOrEqualTo("createdAt", lowerDate);
            tdQuery.lessThanOrEqualTo("createdAt", upperDate);
            var tdRDPGQuery = tdQuery.equalTo("address", "Regents Drive Parking Garage");
            var tdVMQuery = tdQuery.equalTo("address", "Van Munching");
            tdQuery.find({
                success: function (results) {
                    this.orderDetails = results;
                },
                error: function (error) {

                }
            });




            Parse.User.logIn(username, password, {
                //lunchbrother:manage
                //chef:delivery
                //getcurrentuser's permission
                success: function (user) {
                    var permission = user.get('permission');

                    if (permission == 1) {
                        var manageView = new ManageView();
                        $("#reminder,#loginInfo").remove();
                        $("#page").append(manageView.render().el);
                    }

                    if (permission == 2) {
                        var deliveryView = new DeliveryView({
                            model: this.orderDetails
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
