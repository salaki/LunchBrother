var config = {
//    "appUrl": "https://lunchbrother.com/"
    "appUrl": "http://localhost:63342/public/app/index.html",
    "baseUrl": "js",
    "paths": {
        jquery: 'libs/jquery/jquery-1.11.2.min',
        i18n: 'libs/require/i18n',
        underscore: 'libs/underscore/underscore-min',
        //backbone: 'libs/backbone/backbone-min',
        parse: 'libs/parse/parse-1.3.2.min',
        stripe: 'libs/stripe/stripe.v2',
        templates: '../templates',
        semantic: 'libs/semantic/semantic.min',
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
        'main': ['parse', 'i18n'],
        // 'parse':['jquery', 'underscore'],
        "semantic": ['jquery'],
        "libs/semantic/dropdown.min": ["jquery", "semantic"],
        "libs/semantic/checkbox.min": ["jquery", "semantic"],
        "libs/semantic/form.min": ["jquery", "semantic"],
		"libs/semantic/sidebar.min": ["jquery", "semantic"],
	    "facebook": {
	    	exports: 'FB'
	    }
    }
};

var locale = getParameterByName('locale');
if (locale && locale == "zh-cn") {
    config.config = {
        i18n: {
            "locale": "zh-cn"
        }
    };
}

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
