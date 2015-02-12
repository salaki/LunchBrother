define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'views/manage/DeliveryView',
    'views/manage/ManageView',
    'views/home/HomeView',
    'views/account/FbLoginView',
    'i18n!nls/login',
    'text!templates/manage/loginTemplate.html'
], function (PaymentModel, OrderModel, DeliveryView, ManageView, HomeView, FbLoginView, login, loginTemplate) {

    var LoginView = Parse.View.extend({
        el: $("#page"),

        orderDetails: {},

        events: {
            'submit #loginForm': 'continueLogin',
            'click #fbLoginBtn': 'fbLogin'
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
            $("#reminder").html(login.Reminder);
            $("#loginBtnContent").html(login.LoginButton);
            return this;
        },

        continueLogin: function () {
            var self = this;
            var username = this.$("#username").val();
            var password = this.$("#password").val();
            Parse.User.logIn(username, password, {
                //lunchbrother:manage
                //chef:delivery
                //getcurrentuser's permission
                success: function (user) {
                    var permission = user.get('permission');

                    if (permission == 1) {
                        var homeView = new HomeView();
                        window.location.hash = '#home';
                    }

                    if (permission == 3) {
                        var manageView = new ManageView();
                        window.location.hash = '#manage';
                    }

                    if (permission == 2) {
                        var deliveryView = new DeliveryView();
                        window.location.hash = '#delivery';
                    }
                },
                error: function (user, error) {
                	self.$("#loginError").removeClass("hidden");
                    self.$("#loginError").text("Invalid Username or Password");
                    self.$("#loginForm button").removeAttr("disabled");
                }
            });
            var $form = this.$('form');
            $form.find('#loginBtn').prop('disabled', true);
            return false;
        },
        
        fbLogin: function(){
        	var fbLoginView = new FbLoginView();
        	fbLoginView.render();
        }
    });
    return LoginView;
});
