define([
  'models/manage/DeliveryModel',
  'text!templates/status/statusTemplate.html',
  'text!templates/home/homeTemplate.html',
  'i18n!nls/status'
], function (DeliveryModel, statusTemplate, homeTemplate, status) {

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
            $("h1.ui.small.center.aligned.header").html(status.statusHeader);
            $("#contact1").html(status.contact1);
            $("#contact2").html(status.contact2);
            $("#status1").html(status.status1);
            $("#status2").html(status.status2);

            var current = new Date();
            var currentHour = current.getHours();
                //Delivery man starts working from 11:00-14:00, otherwise is on rest.
            if(currentHour <= 10 || currentHour >= 14) {
            
                $("#status1").text("Zzzzz...");
                $("#status2").text("Zzzzz...");

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
                            if(locale == "zh-cn"){
                            $("#status1").text("我已到达!");
                            $("#status1").addClass("red");
                           }
                           if(locale !== "zh-cn"){
                            $("#status1").text("Arrived!");
                            $("#status1").addClass("red");
                           }
                        }
                        if (result.get("address") == "McKeldin Library") {
                            if(locale == "zh-cn"){
                            $("#status2").text("我已到达!");
                            $("#status2").addClass("red");
                           }
                           if(locale !== "zh-cn"){
                            $("#status2").text("Arrived!");
                            $("#status2").addClass("red");
                           }
                        }
                        });
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                    }
                });
            }

            return this;
        }
    });

    return StatusView;

});
