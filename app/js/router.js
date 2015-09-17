define([
    'views/home/LandingView',
  'views/home/HomeView',
  'views/order/OrderView',
  'views/order/PolicyView',
  'views/confirm/ConfirmView',
  'views/status/StatusView',
  'views/manage/LoginView',
  'views/manage/DistributorView',
  'views/manage/ManagerHomeView',
  'views/manage/MenuEditView',
  'views/manage/DriverView',
  'views/account/LoginorsignupView',
  'views/account/SignupemailView',
  'views/account/ProfileView',
	'views/account/ForgotpasswordView',
    'views/account/ResetPasswordView'
], function (LandingView,
        HomeView,
		OrderView, 
		PolicyView, 
		ConfirmView, 
		StatusView, 
		LoginView, 
		DistributorView,
        ManagerHomeView,
        MenuEditView,
		DriverView,
		LoginorsignupView, 
		SignupemailView,
		ProfileView,
		ForgotpasswordView,
        ResetPasswordView) {

    var AppRouter = Parse.Router.extend({
        routes: {
            // Define some URL routes
            'order': 'showOrder',
            'landing': 'showLanding',
            'home': 'showHome',
            'policy': 'showPolicy',
            'confirm': 'showConfirm',
            'status': 'showStatus',
            'login': 'showLogin',
            'distributor': 'showDistributor',
            'driver': 'showDriver',
	    //'loginorsignup' : 'showLoginorsignup',
            'managerHome?*queryString': 'showManagerHome',
            'menuEdit?*queryString': 'showMenuEdit',
            'profile': 'showProfile',
            'signupemail' : 'showSignupemail',
            'forgotpassword' : 'showForgotpassword',
            'resetPassword?*queryString' : 'showResetPassword',
            // Default
            '*actions': 'defaultAction'
        }
    });

    var ParseQueryString = function(queryString){
            var params = {};
            if(queryString){
                _.each(
                    _.map(decodeURI(queryString).split(/&/g),function(el,i){
                        var aux = el.split('='), o = {};
                        if(aux.length >= 1){
                            var val = undefined;
                            if(aux.length == 2)
                                val = aux[1];
                            o[aux[0]] = val;
                        }
                        return o;
                    }),
                    function(o){
                        _.extend(params,o);
                    }
                );
            }
            return params;
        }

    var initialize = function () {
        console.log('router initialize');

        var appRouter = new AppRouter();
	    var permission = 0;

          appRouter.on('route:showOrder', function () {
              var currentUser = Parse.User.current();
              if(currentUser != null) {
                  permission = currentUser.get('permission');
              }
              if(permission >=1){
                  // Call render on the module we loaded in via the dependency array
                  var orderView = new OrderView();
                  orderView.render();
              }
          });

          appRouter.on('route:showPolicy', function () {
              var currentUser = Parse.User.current();
              if(currentUser != null) {
                  permission = currentUser.get('permission');
              }
              if(permission >=1) {
                  // Call render on the module we loaded in via the dependency array
                  var policyView = new PolicyView();
                  policyView.render();
              }
          });

          appRouter.on('route:showConfirm', function () {
              var currentUser = Parse.User.current();
              if(currentUser != null) {
                  permission = currentUser.get('permission');
              }
              if(permission >=1) {
                  // Call render on the module we loaded in via the dependency array
                  var confirmView = new ConfirmView();
                  confirmView.render();
              }
          });

          appRouter.on('route:showStatus', function () {
              var currentUser = Parse.User.current();
              if(currentUser != null) {
                  var statusView = new StatusView();
                  statusView.render();
              } else {
                  var loginorsignupView = new LoginorsignupView();
                  loginorsignupView.render();
              }
          });


          appRouter.on('route:showHome', function () {
              var currentUser = Parse.User.current();
              if(currentUser != null) {
                  var homeView = new HomeView();
                  homeView.render();
              } else {
                  var loginorsignupView = new LoginorsignupView();
                  loginorsignupView.render();
              }
          });

        appRouter.on('route:showLanding', function () {
            var landingView = new LandingView();
            landingView.render();
        });

        appRouter.on('route:showLogin', function () {
            // Call render on the module we loaded in via the dependency array
            var loginView = new LoginView();
            loginView.render();
        });

        appRouter.on('route:showSignupemail', function () {
            // Call render on the module we loaded in via the dependency array
            var signupemailView = new SignupemailView({ 
            	model: {
            		refer: getParameterByName('refer')
        		}
        	});
            
            signupemailView.render();
        });

        appRouter.on('route:showDistributor', function () {
            // Call render on the module we loaded in via the dependency array
            var distributorView = new DistributorView();
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                permission = currentUser.get('permission');
            }
            if (permission === DISTRIBUTOR || permission === LOCAL_MANAGER) {
                 distributorView.render();
            } else {
                window.location.hash = "#login";
            }
        });

        appRouter.on('route:showDriver', function () {
            // Call render on the module we loaded in via the dependency array
            var driverView = new DriverView();
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                permission = currentUser.get('permission');
            }
            if (permission === DRIVER || permission === LOCAL_MANAGER) {
                 driverView.render();
            } else {
                window.location.hash = "#login";
            }
        });

        appRouter.on('route:showManagerHome', function (queryString) {
            // Call render on the module we loaded in via the dependency array
            var params = new ParseQueryString(queryString);
            var managerHomeView = new ManagerHomeView({
                week: params.week
            });

            var currentUser = Parse.User.current();
            if(currentUser != null) {
                permission = currentUser.get('permission');
            }
            if (permission === LOCAL_MANAGER) {
                managerHomeView.render();
            } else {
                window.location.hash = "#login";
            }
        });

        appRouter.on('route:showMenuEdit', function (queryString) {
            // Call render on the module we loaded in via the dependency array
            var params = new ParseQueryString(queryString);
            var menuEditView = new MenuEditView({
                inventoryIds: params.inventoryIds,
                date: params.date
            });

            var currentUser = Parse.User.current();
            if(currentUser != null) {
                permission = currentUser.get('permission');
            }
            if (permission === LOCAL_MANAGER) {
                menuEditView.render();
            } else {
                window.location.hash = "#login";
            }
        });

        appRouter.on( 'route:showProfile', function () {
            var profileView = new ProfileView();
            profileView.render();
        });

        appRouter.on('route:showLoginorsignup', function () {
            // Call render on the module we loaded in via the dependency array
			console.log("showLoginorsignup");
            var loginorsignupView = new LoginorsignupView();
            loginorsignupView.render();
        });

        appRouter.on('route:showSignup', function () {
            // Call render on the module we loaded in via the dependency array
            var signupView = new SignupView();
            signupView.render();
        });
			
        appRouter.on('route:showForgotpassword', function () {
            // Call render on the module we loaded in via the dependency array
            var forgotpasswordView = new ForgotpasswordView();
            forgotpasswordView.render();
        });

        appRouter.on('route:showResetPassword', function (queryString) {
            var params = new ParseQueryString(queryString);
            var resetPasswordView = new ResetPasswordView({
                userId: params.userId,
                resetKey: params.resetKey
            });
            resetPasswordView.render();
        });

        appRouter.on('route:defaultAction', function (actions) {
            var currentUser = Parse.User.current();
            // we have no matching route, lets display the signup&login page
            if(currentUser != null) {
                var homeView = new HomeView();
                homeView.render();
            }else{
                var loginorsignupView = new LoginorsignupView();
                loginorsignupView.render();
            }
        });

        Parse.history.start();
    };
    return {
        initialize: initialize
    };
});
