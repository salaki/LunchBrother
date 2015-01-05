define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/HomeView',
  ], function($, _, Backbone, HomeView){

  var AppRouter = Backbone.Router.extend({
    routes: {
      // Define some URL routes
      'projects': 'showProjects',
      'users': 'showContributors',
      
      // Default
      '*actions': 'defaultAction'
    }
  });
  
  var initialize = function(){
    console.log('router initialize');

    var appRouter = new AppRouter();
    
    /*appRouter.on('route:showProjects', function(){
   
        // Call render on the module we loaded in via the dependency array
        var projectsView = new ProjectsView();
        projectsView.render();

    });*/

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