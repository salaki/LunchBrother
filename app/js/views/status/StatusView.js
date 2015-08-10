define([
    'models/manage/DeliveryModel',
    'models/pickUpLocation',
    'models/order/PaymentModel',
    'text!templates/status/statusTemplate.html'
], function (DeliveryModel, PickUpLocationModel, PaymentModel, statusTemplate) {

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
            $('.menu li').removeClass('active');
            $('.menu li a[href="#"]').parent().addClass('active');

            var current = new Date();
            var currentHour = current.getHours();

            //Delivery man starts working from 11:00-14:00, otherwise is at rest.
            if(currentHour <= 11 || currentHour >= 14) {
                this.$el.html(this.template({rest: true, locationName: "", contactName: "", contactNumber: "", status: ""}));
                $("#mapHolder").hide();
            } else {
                //Time Range for querying the order from the current user
                var current = new Date();
                var currentHour = current.getHours();
                if (currentHour > 14) {
                    //After 14:00, display the orders from today 2pm to tomorrow 12pm
                    var upperDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                    upperDate.setHours(12, 0, 0, 0);
                    var lowerDate = current;
                    lowerDate.setHours(14, 0, 0, 0);
                }
                else {
                    //Before 14:00, display the orders from yesterday 2pm to today 12pm
                    upperDate = current;
                    upperDate.setHours(12, 0, 0, 0);
                    lowerDate = new Date(current.getTime() - 24 * 60 * 60 * 1000);
                    lowerDate.setHours(14, 0, 0, 0);
                }

                var self = this;
                var currentUser = Parse.User.current();
                var paymentQuery = new Parse.Query(PaymentModel);
                paymentQuery.equalTo('email', currentUser.get('email'));
                paymentQuery.greaterThan("createdAt", lowerDate);
                paymentQuery.lessThan("createdAt", upperDate);
                paymentQuery.include("pickUpLocation");
                paymentQuery.include("pickUpLocation.gridId");
                paymentQuery.find({
                    success: function(payments) {
                        if (payments.length !== 0) {
                            self.displayDriverLocation(payments[0].get("pickUpLocation").get("coordinate").latitude,
                                payments[0].get("pickUpLocation").get("coordinate").latitude,
                                payments[0].get("pickUpLocation").get("address"),
                                payments[0].get("pickUpLocation").get("distributor"),
                                payments[0].get("pickUpLocation").get("gridId").get("driver"));
                        } else {
                            self.$el.html(self.template({rest: false, locationName: "", contactName: "", contactNumber: "", status: ""}));
                            $("#mapHolder").hide();
                        }
                    },
                    error: function(error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            }

            return this;
        },

        displayDriverLocation: function(pickUpLocationLatitude, pickUpLocationLongitude, locationName, distributor, driver) {
            var current = new Date();
            var self = this;
            var deliverQuery = new Parse.Query(DeliveryModel);
            deliverQuery.equalTo("deliverBy", {__type: "Pointer", className: "_User", objectId: driver.id});
            deliverQuery.lessThan("updatedAt", current);
            deliverQuery.descending("updatedAt");
            deliverQuery.first({
                success: function (delivery) {
                    self.$el.html(self.template({rest: false, locationName: locationName, contactName: distributor.get('firstName'), contactNumber: distributor.get('telnum'), status: delivery.get('status')}));
                    $("h1.ui.small.center.aligned.header").html("Where is your delivery man?");

                    var pickUpLocation = new google.maps.LatLng(pickUpLocationLatitude, pickUpLocationLongitude);
                    var myOptions = {
                        center: pickUpLocation,
                        zoom: 14,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControl: false,
                        streetViewControl:false,
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
        }
    });

    return StatusView;

});
