require.config({
    "baseUrl": "js",
    "paths": {
        jquery: 'libs/jquery/jquery-1.9.1.min',
        underscore: 'libs/underscore/underscore-min',
        backbone: 'libs/backbone/backbone-min',
        templates: '../templates',
        semantic: 'libs/semantic/semantic.min'
    },
    shim: {
        "libs/semantic/dropdown.min" :["jquery", "semantic"]
    }
});

// Load the main app module to start the app
require(["main"], function(main){
    main.initialize();
});