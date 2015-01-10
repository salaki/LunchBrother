define([
  'views/home/HomeView',
  'views/pay/PayView',
  'views/confirm/ConfirmView',
  'views/status/StatusView',
  'views/manage/ManageView'
  ], function(HomeView, PayView, ConfirmView, StatusView,ManageView){
    
  var AppRouter = Parse.Router.extend({
    routes: {
      // Define some URL routes
      'pay': 'showPay',
      'confirm':'showConfirm',
      'status':'showStatus',
      'manage':'showManage',
      
      // Default
      '*actions': 'defaultAction'
    }
  });
  
  var initialize = function(){
    console.log('router initialize');

    var appRouter = new AppRouter();
    
    appRouter.on('route:showPay', function(){
   
        // Call render on the module we loaded in via the dependency array
        var payView = new PayView();
        payView.render();

    });
    
    appRouter.on('route:showConfirm', function(){
   
        // Call render on the module we loaded in via the dependency array
        var confirmView = new ConfirmView();
        confirmView.render();

    });
    
    appRouter.on('route:showStatus', function(){
   
        // Call render on the module we loaded in via the dependency array
        var statusView = new StatusView();
        statusView.render();
    });
    
     appRouter.on('route:showManage', function(){
        // Call render on the module we loaded in via the dependency array
        var manageView = new ManageView();
        manageView.render();
    });
    
    appRouter.on('route:defaultAction', function (actions) {
     
       // We have no matching route, lets display the home page 
        var homeView = new HomeView();
        homeView.render();
    });

    Parse.history.start();
  };
  return {
    initialize: initialize
  }
})