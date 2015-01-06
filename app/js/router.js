define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  'views/pay/PayView',
  'views/confirm/ConfirmView'
  ], function($, _, Backbone, HomeView, PayView, ConfirmView){

  var AppRouter = Backbone.Router.extend({
    routes: {
      // Define some URL routes
      'pay': 'showPay',
      'confirm':'showConfirm',
      'users': 'showContributors',
      
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

    appRouter.on('route:defaultAction', function (actions) {
     
       // We have no matching route, lets display the home page 
        var homeView = new HomeView();
        homeView.render();
    });

    Backbone.history.start();
  };
  return {
    initialize: initialize
  }
})