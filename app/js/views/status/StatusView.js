define([
    'models/manage/DeliveryModel',
    'models/pickUpLocation',
    'text!templates/status/statusTemplate.html'
], function (DeliveryModel, PickUpLocationModel, statusTemplate) {

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
            //TODO@Jack - Add logic to show status if necessary
            //TODO@Jack - Query payment for the user (include pickUpLocation), if none, show "Your have no order today"
            //TODO@Jack - Figure out how to query the delivery class

            var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
            pickUpLocationQuery.get('l12VYt13PT', {
                success: function (destination) {
                    var deliverQuery = new Parse.Query(DeliveryModel);
                    deliverQuery.equalTo("deliverBy", {__type: "Pointer", className: "_User", objectId: "j2Uz1eNwyW"});
                    deliverQuery.first({
                        success: function (delivery) {
                            var pickUpLocation = new google.maps.LatLng(destination.get('coordinate').latitude, destination.get('coordinate').longitude);
                            var myOptions = {
                                center: pickUpLocation,
                                zoom: 14,
                                mapTypeId: google.maps.MapTypeId.ROADMAP,
                                mapTypeControl: false,
                                navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}
                            };
                            var icon = 'img/car.png';
                            var map = new google.maps.Map(document.getElementById("mapHolder"), myOptions);
                            var driverLocation = new google.maps.LatLng(delivery.get('latitude'), delivery.get('longitude'));
                            var driverMarker = new google.maps.Marker({position: driverLocation, map: map, icon: icon, title: "Your lunch is here!"});
                            var pickUpLocationMarker = new google.maps.Marker({position: pickUpLocation, map: map, title: "Your are here!"});
                        },
                        error: function (error) {
                            alert("Error: " + error.code + " " + error.message);
                        }
                    });

                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        }
    });

    return StatusView;

});
