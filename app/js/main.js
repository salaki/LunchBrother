define([
  'router',
  'jquery',
  "i18n!nls/string",
  'semantic',
  'libs/semantic/dropdown.min'
], function(router,$,string) {
   'use strict';
   
  var initialize = function() {
    console.log("main init");
    
    var appId = 'shB8up4c14Idr6eFH4SBjzqZ1vdYT0Q79LSaPQwT';
    var jsKey = 'PQrHeggtLnjUfFh4KI1IV5vLhZXztUzfdlUnk5X2';

    Parse.initialize(appId, jsKey);
    
    
    router.initialize();
    
    $("title").html(string.title);
    $("#orderDish").html(string.orderDish);
    $("#statusCheck").html(string.statusCheck);
    $(".brand").html(string.brand);
    $("#barTitle").html(string.barTitle);
    $("#mobileOrder").html(string.mobileOrder);
    $("#mobileStatus").html(string.mobileStatus);
    $("#language,#mobileLanguage").html(string.language,string.mobileLanguage);
    $("#mobileStatus").html(string.mobileStatus);
    
    

    $('.ui.dropdown').dropdown();
    var cnDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var today = new Date();
    var dayOfWeek = cnDay[today.getDay()];
    var date = today.toLocaleDateString();
    $('#today').text(dayOfWeek + ', ' + date);

    $('#signOutBtn').click(function() {
        $('.ui.sidebar').sidebar('hide');
        Parse.User.logOut();
	    window.location.href='#login';
	    location.reload();
        $('#account').hide();
    });

    $('#account').click(function() {
         $('.ui.sidebar').sidebar('toggle');
    });
  };

  return {
    initialize: initialize
  };
});
