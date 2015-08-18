var config = {
    "appUrl": "https://lunchbrother.com",
//    "appUrl": "http://localhost/lunchbrother/app/index.html",
    "baseUrl": "js",
    "paths": {
        jquery: 'libs/jquery/jquery-1.11.2.min',
        jquery_ui: 'libs/jquery-ui-1.11.4.custom/jquery-ui.min',
        underscore: 'libs/underscore/underscore-min',
        //backbone: 'libs/backbone/backbone-min',
        parse: 'libs/parse/parse-1.3.2.min',
        stripe: 'libs/stripe/stripe.v2',
        templates: '../templates',
        semantic: 'libs/semantic_2.0/semantic.min',
        facebook: '//connect.facebook.net/en_US/sdk'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        jquery: {
            exports: '$'
        },
        parse: {
            deps: ['jquery', 'underscore'],
            exports: 'Parse'
        },
        'main': ['parse'],
        // 'parse':['jquery', 'underscore'],
        "semantic": ['jquery'],
        "libs/semantic_2.0/gdropdown.min": ["jquery", "semantic"],
        "libs/semantic_2.0/gcheckbox.min": ["jquery", "semantic"],
        "libs/semantic_2.0/gform.min": ["jquery", "semantic"],
		"libs/semantic_2.0/gsidebar.min": ["jquery", "semantic"],
	    "facebook": {
	    	exports: 'FB'
	    }
    }
};



//Permission code
var GENERAL_USER = 1, LOCAL_MANAGER = 2, DRIVER = 3, DISTRIBUTOR = 4;

require.config(config);

// Load the main app module to start the app
require(["main"], function(main) {
    main.initialize();
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
