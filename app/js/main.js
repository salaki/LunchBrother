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
        $("#userEmail").text("");
        $("#userPhone").text("");
        $("#userFullName").text("");
        $("#userCreditBalance").text("");
        $("#accountBarFirstName").text("");
	    window.location.href='#';
	    location.reload();
        $('#account').hide();
    });

      $(".editlink").on("click", function(e){
          e.preventDefault();
          var dataset = $(this).prev(".datainfo");
          var savebtn = $(this).next(".savebtn");
          var theid   = dataset.attr("id");
          var newid   = theid+"-form";
          var currval = dataset.text();
          dataset.empty();
          $('<input type="text" name="'+newid+'" id="'+newid+'" value="'+currval+'" class="hlite">').appendTo(dataset);
          $(this).css("display", "none");
          savebtn.css("display", "block");
      });
      $(".savebtn").on("click", function(e){
          e.preventDefault();
          var elink   = $(this).prev(".editlink");
          var dataset = elink.prev(".datainfo");
          var newid   = dataset.attr("id");
          var cinput  = "#"+newid+"-form";
          var newval  = $(cinput).val();
          $(this).css("display", "none");
          dataset.html(newval);
          elink.css("display", "block");

          var currentUser = Parse.User.current();
          if (newid.indexOf('Email') > -1) {
              currentUser.set( "email", newval );
          } else {
              currentUser.set( "telnum", Number(newval) );
          }
          currentUser.save( null, {
              success: function ( user )
              {
                  //Do nothing
              },
              error: function ( user, error )
              {
                  alert( "Error: " + error.code + " " + error.message );
              }
          } );
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
