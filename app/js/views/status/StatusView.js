define([
  //取query
  'models/manage/DeliveryModel',
  'text!templates/status/statusTemplate.html'
], function (DeliveryModel, statusTemplate) {

    var StatusView = Parse.View.extend({
        el: $("#page"),

        template: _.template(statusTemplate),

        initialize: function () {
            _.bindAll(this, 'render');
        },

        render: function () {
            var self = this;
            this.deliveryDetails = new DeliveryModel();
            $('.menu li').removeClass('active');
            $('.menu li a[href="#"]').parent().addClass('active');
            var lowerDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
            lowerDate.setHours(14, 0, 0, 0);
            var upperDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            upperDate.setHours(13, 0, 0, 0);
            var statusQuery = new Parse.Query(DeliveryModel);
            statusQuery.greaterThan("createdAt", lowerDate);
            statusQuery.lessThan("createdAt", upperDate);
            statusQuery.find({
                success: function (results) {
                    _.each(results, function (result) {
                        if (result.get("address") == "Regents Drive Parking Garage") {
                            $("#status1").text("我已到达!");
                            $("#status1").addClass("red");
                        }
                        if (result.get("address") == "Van Munching") {
                            $("#status1").text("我已到达!");
                            $("#status1").addClass("red");
                        }
                    });
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
            this.$el.html(this.template());
            return this;
        }
    });

    return StatusView;

});