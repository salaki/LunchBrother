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
    
    var appId = 'Cgz1qCbMW85tSsBrYhMlWThKm1pYT5D4U0NmEGxX';
    var jsKey = 'FAfMIEjgQENLxipP5ddW3YYqu14l9dG9uzGyRSLG';

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
        $("#userEmail").text("");
        $("#userPhone").text("");
        $("#userFullName").text("");
        $("#userCreditBalance").text("");
        $("#accountBarFirstName").text("");
	    window.location.href='#';
	    location.reload();
        $('#account').hide();
    });

    $('#account').click(function() {
         $('.ui.sidebar').sidebar('toggle');
    });
    
    $('.refer').click(function(){
    	this.setSelectionRange(0, this.value.length);
    });
  };

  return {
    initialize: initialize
  };
});
