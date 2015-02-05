define([
  'views/home/HomeView',
  'views/order/OrderView',
  'views/order/PolicyView',
  'views/confirm/ConfirmView',
  'views/status/StatusView',
  'views/manage/LoginView',
  'views/manage/ManageView',
  'views/manage/DeliveryView',
	'views/account/LoginorsignupView'
	
], function (HomeView, OrderView, PolicyView, ConfirmView, StatusView, LoginView, ManageView, DeliveryView, LoginorsignupView) {

    var AppRouter = Parse.Router.extend({
        routes: {
            // Define some URL routes
            'order': 'showOrder',
            'policy': 'showPolicy',
            'confirm': 'showConfirm',
            'status': 'showStatus',
            'login': 'showLogin',
            'manage': 'showManage',
            'delivery': 'showDelivery',
						'loginorsignup' : 'showLoginorsignup',
            // Default
            '*actions': 'defaultAction'
        }
    });

    var initialize = function () {
        console.log('router initialize');

        var appRouter = new AppRouter();

        appRouter.on('route:showOrder', function () {

            // Call render on the module we loaded in via the dependency array
            var orderView = new OrderView();
            orderView.render();
        });

        appRouter.on('route:showPolicy', function () {
            // Call render on the module we loaded in via the dependency array
            var policyView = new PolicyView();
            policyView.render();
        });

        appRouter.on('route:showConfirm', function () {

            // Call render on the module we loaded in via the dependency array
            var confirmView = new ConfirmView();
            confirmView.render();

        });

        appRouter.on('route:showStatus', function () {

            // Call render on the module we loaded in via the dependency array
            var statusView = new StatusView();
            statusView.render();
        });

        appRouter.on('route:showLogin', function () {
            // Call render on the module we loaded in via the dependency array
            var loginView = new LoginView();
            loginView.render();
        });

        appRouter.on('route:showManage', function () {
            // Call render on the module we loaded in via the dependency array
            var manageView = new ManageView();
            var currentUser = Parse.User.current();
            if (currentUser.get('permission') == 1) {
                 manageView.render();
            } else {
                window.location.hash = "#login";
            }
        });

        appRouter.on('route:showDelivery', function () {
            // Call render on the module we loaded in via the dependency array
            var deliveryView = new DeliveryView();
            var currentUser = Parse.User.current();
            if (currentUser.get('permission') == 2) {
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

        appRouter.on('route:defaultAction', function (actions) {

            // We have no matching route, lets display the home page 
            var homeView = new HomeView();
        });

        Parse.history.start();
    };
    return {
        initialize: initialize
    };
});
