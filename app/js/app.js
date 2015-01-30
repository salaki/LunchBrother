// var newURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
require.config({
    "baseUrl": "js",
    "paths": {
        jquery: 'libs/jquery/jquery-1.11.2.min',
        i18n:'libs/require/i18n',
        underscore: 'libs/underscore/underscore-min',
        //backbone: 'libs/backbone/backbone-min',
        parse: 'libs/parse/parse-1.3.2.min',
        stripe: 'libs/stripe/stripe.v2',
        templates: '../templates',
        semantic: 'libs/semantic/semantic.min'
    },
    // "locale": "zh-ch",
    shim: {
        underscore:{
            exports:'_'
        },
        jquery:{
          exports: '$'  
        },
        parse:{
          deps:['jquery', 'underscore'],
          exports:'Parse'
        },
        'main': ['parse'],
        // 'parse':['jquery', 'underscore'],
        "semantic": ['jquery'],
        "libs/semantic/dropdown.min" :["jquery", "semantic"],
        "libs/semantic/checkbox.min" :["jquery", "semantic"],
        "libs/semantic/form.min" :["jquery", "semantic"],
    }
});

// Load the main app module to start the app
require(["main"], function(main){
    main.initialize();
});
