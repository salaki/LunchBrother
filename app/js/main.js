define([
  'router',
  'jquery',
  'semantic',
  'jquery_ui',
  'libs/semantic_2.0/components/dropdown.min'
], function(router,$) {
   'use strict';
   
  var initialize = function() {
    console.log("main init");
    
    var appId = 'Cgz1qCbMW85tSsBrYhMlWThKm1pYT5D4U0NmEGxX';
    var jsKey = 'FAfMIEjgQENLxipP5ddW3YYqu14l9dG9uzGyRSLG';

    Parse.initialize(appId, jsKey);
    
    router.initialize();

      var currentUser = Parse.User.current();

    $('.ui.dropdown').dropdown();
    var cnDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var today = new Date();
    var dayOfWeek = cnDay[today.getDay()];
    var date = today.toLocaleDateString();
    $('#today').text(dayOfWeek + ', ' + date);
    
    //The logo direct to the home page
    $(".brand").on("click", function(){
    	window.location.href="#";
    	location.reload();
    });

      if (currentUser != null) {
          currentUser.fetch();
          $("#userEmail").text(currentUser.get('email'));
          var gridId = "nmbyDzTp7m";
          if (currentUser.get('gridId') == undefined) {
              $("#userGrid").text("University of Maryland College Park");
          }else {
              var GridModel = Parse.Object.extend("Grid");
              var gridQuery = new Parse.Query(GridModel);
              gridId = currentUser.get('gridId').id;
              gridQuery.get(currentUser.get('gridId').id, {
                  success: function(grid) {
                      $("#userGrid").text(grid.get('name'));
                  },
                  error: function(object, error) {
                      console.log(error.message);
                  }
              });
          }
          $("#userPhone").text(currentUser.get('telnum'));
          $("#userFullName").text(currentUser.get('firstName') + " " + currentUser.get('lastName'));
          $("#userCreditBalance").text("$" + currentUser.get('creditBalance').toFixed(2));
          $("#accountBarFirstName").text(currentUser.get('firstName'));
          $('#referlink input').val('https://www.lunchbrother.com/?refer=' + currentUser.id + '#signupemail');
          $('#account').show();
      }
    
    $('#signOutBtn').click(function() {
        $('.ui.sidebar').sidebar('hide');

        //Update registration code state
        var RegistrationCode = Parse.Object.extend("RegistrationCode");
        if (currentUser.get('permission') === GENERAL_USER) {
            var codeQuery = new Parse.Query(RegistrationCode);
            codeQuery.equalTo("loginBy", currentUser);
            codeQuery.first({
                success: function(code) {
                    code.unset("loginBy");
                    code.set("usedToLogin", false);
                    code.save();
                    continueSignOut();
                },
                error: function(error) {
                    console.log('Update failed! Reason: ' + error.message);
                }
            });
        } else {
            continueSignOut()
        }
    });

      var continueSignOut = function() {
          Parse.User.logOut();
          $("#userEmail").text("");
          $("#userPhone").text("");
          $("#userFullName").text("");
          $("#userCreditBalance").text("");
          $("#accountBarFirstName").text("");
          window.location.href='#';
          location.reload();
          $('#account').hide();
      };

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
                  showMessage("Error", "Save user failed! Reason: " + error.message);
              }
          } );
      });
      $("#smsCheckbox").on("change", function(e){
          e.preventDefault();
          if ($(this).is(':checked')) {
              currentUser.set( "smsEnabled", true );
          } else {
              currentUser.set( "smsEnabled", false );
          }
          currentUser.save( null, {
              success: function ( user )
              {
                  //Do nothing
              },
              error: function ( user, error )
              {
                  showMessage("Error", "Save user failed! Reason: " + error.message);
              }
          } );
      });

      $('#account').click(function() {
          if (currentUser.get('smsEnabled') == undefined || currentUser.get('smsEnabled') == true) {
              $("#smsCheckbox").prop('checked', true);
          } else {
              $("#smsCheckbox").prop('checked', false);
          }
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
