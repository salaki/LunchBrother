define([
  'views/home/HomeView',
  'views/order/OrderView',
  'views/order/PolicyView',
  'views/confirm/ConfirmView',
  'views/status/StatusView',
  'views/manage/LoginView',
  'views/manage/ManageView',
  'views/manage/DeliveryView',
  'views/account/LoginorsignupView',
  'views/account/SignupemailView'
	
], function (HomeView, OrderView, PolicyView, ConfirmView, StatusView, LoginView, ManageView, DeliveryView, LoginorsignupView, SignupemailView) {

    var AppRouter = Parse.Router.extend({
        routes: {
            // Define some URL routes
            'order': 'showOrder',
            'home': 'showHome',
            'policy': 'showPolicy',
            'confirm': 'showConfirm',
            'status': 'showStatus',
            'login': 'showLogin',
            'manage': 'showManage',
            'delivery': 'showDelivery',
	    //'loginorsignup' : 'showLoginorsignup',
	    'signupemail' : 'showSignupemail',			
            // Default
            '*actions': 'defaultAction'
        }
    });

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
                  permission = currentUser.get('permission');
              }
              if(permission >=1) {
                  // Call render on the module we loaded in via the dependency array
                  var statusView = new StatusView();
                  statusView.render();
              }
          });

          appRouter.on('route:showHome', function () {
              var currentUser = Parse.User.current();
              if(currentUser != null) {
                  permission = currentUser.get('permission');
              }
              if(permission >=1) {
                  // Call render on the module we loaded in via the dependency array
                  var homeView = new HomeView();
                  homeView.render();
              }
          });

        appRouter.on('route:showLogin', function () {
            // Call render on the module we loaded in via the dependency array
            var loginView = new LoginView();
            loginView.render();
        });

        appRouter.on('route:showSignupemail', function () {
            // Call render on the module we loaded in via the dependency array
            var signupemailView = new SignupemailView();
            signupemailView.render();
        });

        appRouter.on('route:showManage', function () {
            // Call render on the module we loaded in via the dependency array
            var manageView = new ManageView();
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                permission = currentUser.get('permission');
            }
            if (permission == 3) {
                 manageView.render();
            } else {
                window.location.hash = "#login";
            }
        });

        appRouter.on('route:showDelivery', function () {
            // Call render on the module we loaded in via the dependency array
            var deliveryView = new DeliveryView();
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                permission = currentUser.get('permission');
            }
            if (permission == 2) {
                 deliveryView.render();
            } else {
                window.location.hash = "#login";
            }
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
