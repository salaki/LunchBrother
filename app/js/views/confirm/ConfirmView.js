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


          template: _.template(confirmTemplate),

          render: function() {
            var self = this;
            if (this.model.get('address') == "Regents Drive Parking Garage") {document
              self.model.set("mapUrl", "./img/map_sml_rdg.jpg");
              self.$el.html(self.template(self.model.toJSON()));
            }

            if (this.model.get('address') == "McKeldin Library") {
              self.model.set("mapUrl", "./img/map_sml_mck.jpg");
              self.$el.html(self.template(self.model.toJSON()));
            }
	    this.$("#nameOnOrder").html(confirm.nameOnOrder);//translation test	
						this.$("#confirmEmail").html(confirm.confirmEmail);
						this.$("#pickUpAddress").html(confirm.pickUpAddress);
						//console.log(confirm.pickUpAddress);
						this.$("#orderMessage").html(confirm.orderMessage);
					 console.log(confirm.statusTracker); this.$('#statusTracker').text(confirm.statusTracker);
						
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
