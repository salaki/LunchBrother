define([
  'models/manage/DeliveryModel',
  'text!templates/status/statusTemplate.html',
  'text!templates/home/homeTemplate.html',
], function (DeliveryModel, statusTemplate, homeTemplate) {

    var StatusView = Parse.View.extend({
        el: $("#page"),

        template: _.template(statusTemplate),

        initialize: function () {
            _.bindAll(this, 'render');
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                currentUser.fetch();
                $("#userEmail").text(currentUser.get('email'));
                $("#userPhone").text(currentUser.get('telnum'));
                $("#userFullName").text(currentUser.get('firstName') + " " + currentUser.get('lastName'));
                $("#userCreditBalance").text(currentUser.get('creditBalance').toFixed(2));
                $("#accountBarFirstName").text(currentUser.get('firstName'));
            }
            $('#account').show();
        },

        render: function () {
            var self = this;
            this.deliveryDetails = new DeliveryModel();
            $('.menu li').removeClass('active');
            $('.menu li a[href="#"]').parent().addClass('active');

            this.$el.html(this.template());
            this.displayDriverLocation();
            $("h1.ui.small.center.aligned.header").html("Where is your delivery man?");
            $("#contact1").html("Contact:Fish (724-510-8760)");
            $("#contact2").html("Contact:Jabber (202-812-4286)");
            $("#contact3").html("Contact:Rachel (301-312-4798)");
            $("#status1").html("On your way...");
            $("#status2").html("On your way...");
            $("#status3").html("On your way...");

            var current = new Date();
            var currentHour = current.getHours();
                //Delivery man starts working from 11:00-14:00, otherwise is on rest.
            if(currentHour <= 10 || currentHour >= 14) {
            
                $("#status1").text("Zzzzz...");
                $("#status2").text("Zzzzz...");
                $("#status3").text("Zzzzz...");

            } else {
                var lowerDate = new Date();
                lowerDate.setHours(11, 0, 0, 0);
                var upperDate = new Date();
                upperDate.setHours(13, 0, 0, 0);

                var statusQuery = new Parse.Query(DeliveryModel);
                statusQuery.greaterThan("createdAt", lowerDate);
                statusQuery.lessThan("createdAt", upperDate);
                statusQuery.find({
                success: function (results) {
                    _.each(results, function (result) {
                        if (result.get("address") == "Regents Drive Parking Garage") {
                            $("#status1").text("Arrived!");
                            $("#status1").addClass("red");
                        }
                        if (result.get("address") == "McKeldin Library") {
                            $("#status2").text("Arrived!");
                            $("#status2").addClass("red");
                        }
                        if (result.get("address") == "AV Williams Bldg") {
                                $("#status3").text("Arrived!");
                                $("#status3").addClass("red");                            
                        }
                        });
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                    }
                });
            }

            return this;
        },

        displayDriverLocation: function() {
            //TODO@Jenny - 1. Query Delivery class to get driver's location
            //TODO@Jenny -   (You can start with looking for the most recent one, we'll discuss the actual query later.)
            //TODO@Jenny - 2. Get current user's location (Refer to the functions in DriverView.js)
            //TODO@Jenny - 3. Display both of them on the map
            //TODO@Jenny - (Note: When trying to get your location, your browser has to enable the location tracking.)

            //Here are some example codes for you reference, you can test it by going to "Track Your Order" page
            //at the upper right corner.
            lat = 39.0629783;
            lon = -77.1315743;
            latlon = new google.maps.LatLng(lat, lon);
            var deliverQuery = new Parse.Query(DeliveryModel);
            //deliverQuery.equalTo("deliverBy", {__type: "Pointer", className: "User(Lunchbrother)", objectId: lunchbrother});
            deliverQuery.equalTo("deliverBy", {__type: "Pointer", className: "_User", objectId: "j2Uz1eNwyW"});
            deliverQuery.first({
              success: function(location){
                latlon1 = new google.maps.LatLng(location.get('latitude'), location.get('longitude'));
                var marker = new google.maps.Marker({position:latlon1,map:map,title:"You are here!"});
              },
              error: function(error){
                alert("Error: " + error.code + " " + error.message);
              }
            });
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else { 
                alert("Geolocation is not supported by this browser.");
            }
            function showPosition(position){
            	latlon2 = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            	var marker2 = new google.maps.Marker({position:latlon2,map:map,title:"Your lunch is here!"});
            };
            
            mapholder = document.getElementById('mapHolder');
            mapholder.style.height = '300px';

            var myOptions = {
                center:latlon,
                zoom:14,
                mapTypeId:google.maps.MapTypeId.ROADMAP,
                mapTypeControl:false,
                navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
            }
            var map = new google.maps.Map(document.getElementById("mapHolder"), myOptions);
            //var marker = new google.maps.Marker({position:latlon,map:map,title:"You are here!"});
            //var marker2 = new google.maps.Marker({position:latlon2,map:map,title:"Your lunch is here!"});
        }
    });

    return StatusView;

});
