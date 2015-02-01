define([
      'models/order/PaymentModel',
      'views/order/OrderView',
			'i18n!nls/confirm',
      'text!templates/confirm/confirmTemplate.html'
			
    ], function(PaymentModel, OrderView, confirmTemplate, confirm) {

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
            if (this.model.get('address') == "Regents Drive Parking Garage") {document
              self.model.set("mapUrl", "./img/map_sml_rdg.jpg");
              self.$el.html(self.template(self.model.toJSON()));
            }

            if (this.model.get('address') == "Van Munching") {
              self.model.set("mapUrl", "./img/map_sml_vm.jpg");
              self.$el.html(self.template(self.model.toJSON()));
            }
						
						$("#nameOnOrder").html(confirm.nameOnOrder);//translation test
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
