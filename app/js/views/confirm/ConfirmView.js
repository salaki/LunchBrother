define([
      'models/order/PaymentModel',
      'views/order/OrderView',
      'i18n!nls/confirm',
      'text!templates/confirm/confirmTemplate.html'
			
    ], function(PaymentModel, OrderView, confirm, confirmTemplate) {

      var ConfirmView = Parse.View.extend({

          tagName: "div",
          attributes: {
            class: 'column'
          },

          events: {
             'click #smallmap': 'zoomInMap',
             'click #fullscreen':'zoomOutMap'
          },

          initialize: function() {
            _.bindAll(this, 'render', 'zoomInMap','zoomOutMap');
          },


          template: _.template(confirmTemplate),

          render: function() {
            var self = this;
            if (this.model.get('address') == "Regents Drive Parking Garage") {
              self.model.set("mapUrl", "./img/map_sml_rdg.jpg");
              self.$el.html(self.template(self.model.toJSON()));
            }

	    						
            if (this.model.get('address') == "McKeldin Library") {
              self.model.set("mapUrl", "./img/map_sml_mck.jpg");
              self.$el.html(self.template(self.model.toJSON()));
            }

	    this.$("#nameOnOrder").html(confirm.nameOnOrder);
  	    this.$("#confirmEmail").html(confirm.confirmEmail);
	    this.$("#pickUpAddress").html(confirm.pickUpAddress);
	    this.$("#orderMessage").html(confirm.orderMessage);
	    this.$('#statusTracker').text(confirm.statusTracker);
            this.$("#nameOnOrder").html(confirm.nameOnOrder);
            this.$("#confirmEmail").html(confirm.confirmEmail);
            this.$("#pickUpAddress").html(confirm.pickUpAddress);
            this.$("#orderMessage").html(confirm.orderMessage);
              

            return this;
          },

          zoomInMap: function() {
            $('.ui.segment').hide();
            $("#orderMessage").hide();
            $("#fullscreen").css("display", "block");
          },
          
          zoomOutMap: function(){
            $("#fullscreen").css("display", "none");
            $('.ui.segment').show();
            $("#orderMessage").show();
          }
          });
        return ConfirmView;
      });
