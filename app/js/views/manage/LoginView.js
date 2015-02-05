define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'views/manage/DeliveryView',
    'views/manage/ManageView',
    'text!templates/manage/loginTemplate.html'
], function (PaymentModel, OrderModel, DeliveryView, ManageView, loginTemplate) {

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
            e.preventDefault();
            var self = this;
            var username = this.$("#username").val();
            var password = this.$("#password").val();

            Parse.User.logIn(username, password, {
                success: function (user) {
                    var permission = user.get('permission');

                    if (permission == 1) {
                        var manageView = new ManageView();
                        window.location.hash = "#manage";
                    }

                    if (permission == 2) {
                        var deliveryView = new DeliveryView();
                        window.location.hash = "#delivery";
                    }
                },
                error: function (user, error) {
                    self.$("#loginInfo .error").html("Invalid username or password. Please try again.").show();
                    self.$("#loginForm button").removeAttr("disabled");
                }
            });
        }
    });
    return LoginView;
});
