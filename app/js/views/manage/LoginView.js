define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'views/manage/DriverView',
    'views/manage/DistributorView',
    'views/manage/ManagerHomeView',
    'views/home/HomeView',
    'views/account/FbLoginView',
    'text!templates/manage/loginTemplate.html'
], function (PaymentModel, OrderModel, DriverView, DistributorView, ManagerHomeView, HomeView, FbLoginView, loginTemplate) {

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
                    if (user.get("active") === false) {
                        Parse.User.logOut();
                        alert("You haven't activated your account yet, please activate with the link we sent to you.");
                        window.location.reload();
                    } else {
                        var permission = user.get('permission');

                        if (permission === GENERAL_USER) {
                            window.location.hash = '#home';
                        }

                        if (permission === LOCAL_MANAGER) {
                            window.location.hash = '#managerHome?week=';
                        }

                        if (permission === DRIVER) {
                            window.location.hash = '#driver';
                        }

                        if (permission === DISTRIBUTOR) {
                            window.location.hash = '#distributor';
                        }
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
