//OrderId, fname,lname,email,address
define([
  'models/order/PaymentModel',
  'models/order/ImageModel',
  'views/order/OrderView',
  'text!templates/confirm/confirmTemplate.html'
], function(PaymentModel, ImageModel, OrderView, confirmTemplate) {

  var ConfirmView = Parse.View.extend({

    tagName: "div",
    attributes: {
      class: 'column'
    },
    
    events:{
      'click .map':'zoomInMap'
    },
    
    initialize: function() {
      _.bindAll(this, 'render','zoomInMap');
    },


    template: _.template(confirmTemplate),

    render: function() {
      var self = this;
      var imageQuery = new Parse.Query(ImageModel);
      if (this.model.get('address') == "Regents Drive Parking Garage") {
        imageQuery.equalTo("Image_Id", 13);
        imageQuery.find({
          success: function(results) {
            _.each(results, function(result) {
              var mapURL = result.get('Image_File');
              self.model.set("mapUrl", mapURL.url());
            });
            self.$el.html(self.template(self.model.toJSON()));
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
      }
    
      if (this.model.get('address') == "Van Munching") {
        imageQuery.equalTo("Image_Id", 14);
        imageQuery.find({
           success: function(results) {
            _.each(results, function(result) {
              var mapURL = result.get('Image_File');
              self.model.set("mapUrl", mapURL.url());
              self.model.save();
            });
             self.$el.html(self.template(self.model.toJSON()));
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
      }
      return this;
    },
    
    zoomInMap:function(){
      $('.map').click(function(){
        var $this = $(this);
        $this.toggleClass('big');
        if($(this).hasClass('big')){
          
        }else{
          
        }
      });
    }
  });
  return ConfirmView;
});