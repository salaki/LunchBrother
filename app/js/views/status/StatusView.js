define([
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
	    
            this.$el.html(this.template());

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
                            $("#status1").text("我已到达!");
                            $("#status1").addClass("red");
                        }
                        if (result.get("address") == "McKeldin Library") {
                            $("#status2").text("我已到达!");
                            $("#status2").addClass("red");
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
