define([
    'models/order/PaymentModel',
    'models/order/OrderModel',
    'models/RegistrationCodeModel',
    'views/manage/DriverView',
    'views/manage/DistributorView',
    'views/manage/ManagerHomeView',
    'views/home/HomeView',
    'views/account/FbLoginView',
    'text!templates/manage/loginTemplate.html'
], function (PaymentModel, OrderModel, RegistrationCodeModel, DriverView, DistributorView, ManagerHomeView, HomeView, FbLoginView, loginTemplate) {

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
            //this.$('.ui.form').form({
            //    'username': {
            //        identifier: 'username',
            //        rules: [{
            //            type: 'empty',
            //            prompt: 'Please enter your username'
            //        }]
            //    },
            //    'password': {
            //        identifier: 'password',
            //        rules: [{
            //            type: 'empty',
            //            prompt: 'Please enter your password'
            //        }]
            //    },
            //    'loginRegistrationCode': {
            //        identifier: 'loginRegistrationCode',
            //        rules: [{
            //            type: 'empty',
            //            prompt: 'Please provide your registration code'
            //        }]
            //    }
            //}, {
            //    on: 'blur',
            //    inline: 'true'
            //});
            return this;
        },

        continueLogin: function () {
            var self = this;
            var username = this.$("#username").val();
            var password = this.$("#password").val();
            var registrationCode = this.$("#loginRegistrationCode").val().trim();
            Parse.User.logIn(username, password, {
                success: function (user) {
                    if (user.get("emailVerified") === false) {
                        Parse.User.logOut();
                        showMessage("Error", "You haven't activated your account yet, please activate with the link we sent to you.", function(){
                            window.location.reload();
                        });

                    } else {
                        var permission = user.get('permission');
                        self.showSideBar(user);
                        self.displayBottomBarItems(permission);

                        if (permission === LB_ADMIN) {
                            window.location.hash = '#admin';
                        }

                        if (permission === LOCAL_MANAGER) {
                            window.location.hash = '#managerHome?week=';
                        }

                        if (permission === DISTRIBUTOR) {
                            window.location.hash = '#distributor';
                        }

                        if (permission === DRIVER) {
                            window.location.hash = '#driver';
                        }

                        if (permission === GENERAL_USER) {
                            if (registrationCode) {
                                self.updateRegistrationCodeState(user, registrationCode);
                            } else {
                                showMessage("Registration Code Required", "Please enter a registration code to login!", function(){
                                    Parse.User.logOut();
                                    location.reload();
                                });
                            }
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

        showSideBar: function(currentUser) {
            currentUser.fetch();
            $("#userEmail").text(currentUser.get('email'));
            var gridId = "nmbyDzTp7m";
            if (currentUser.get('gridId') == undefined) {
                $("#userGrid").text("University of Maryland College Park");
            }else {
                var GridModel = Parse.Object.extend("Grid");
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
            //$("#userCreditBalance").text("$" + currentUser.get('creditBalance').toFixed(2));
            $("#accountBarFirstName").text(currentUser.get('firstName'));
            $('#referlink input').val('https://www.lunchbrother.com/?refer=' + currentUser.id + '#signupemail');
            $('#account').show();
        },

        displayBottomBarItems: function(permission) {
            if (permission === LB_ADMIN) {
                $("#bottom-bar-menu").show();
                $("#bottom-bar-tracking").show();
                $("#bottom-bar-manager").show();
                $("#bottom-bar-admin").show();

            } else if (permission === LOCAL_MANAGER) {
                $("#bottom-bar-menu").show();
                $("#bottom-bar-tracking").show();
                $("#bottom-bar-manager").show();

            } else {
                $("#bottom-bar-menu").show();
                $("#bottom-bar-tracking").show();
            }
        },

        fbLogin: function(){
        	var fbLoginView = new FbLoginView();
        	fbLoginView.render();
        },

        updateRegistrationCodeState: function(user, code) {
            var registrationCodeQuery = new Parse.Query(RegistrationCodeModel);
            registrationCodeQuery.get(code, {
                success: function(registrationCode) {
                    if (registrationCode) {
                        registrationCode.set("loginBy", user);
                        registrationCode.set("usedToLogin", true);
                        registrationCode.save(null, {
                            success: function(updatedCode) {
                                window.location.hash = '#home';
                            },
                            error: function(error) {
                                console.log('Save registration code failed! Reason: ' + error.message);
                            }
                        });
                    } else {
                        showMessage("Error", "Your registration code is invalid or has been used to login!", function(){
                            Parse.User.logOut();
                            window.location.hash = '#login';
                        });
                    }
                },
                error: function(error) {
                    console.log('Update failed! Reason: ' + error.message);
                }
            });
        }
    });
    return LoginView;
});
