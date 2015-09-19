define([
    'models/Restaurant',
    'models/Grid',
    'text!templates/manage/newRestaurantTemplate.html'

    ], function (RestaurantModel, GridModel, newRestaurantTemplate) {

      var NewRestaurantView = Parse.View.extend({
          el: $("#page"),

          template: _.template(newRestaurantTemplate),

          events: {
              'click #saveRestaurantBtn': 'saveRestaurant'
          },

          initialize: function () {
            _.bindAll(this, 'render', 'saveRestaurant');

          },

          render: function () {
              var gridQuery = new Parse.Query(GridModel);
              var self = this;
              gridQuery.find({
                  success: function(grids) {
                      self.$el.html(self.template({grids: grids}));
//                      $('.ui.form').form({
//                          'restaurantName': {
//                              identifier: 'restaurantName',
//                              rules: [{
//                                  type: 'empty',
//                                  prompt: 'Please enter your restaurant name'
//                              }]
//                          },
//                          'yelpLink': {
//                              identifier: 'yelpLink',
//                              rules: [{
//                                  type: 'empty',
//                                  prompt: 'Please enter your yelp link'
//                              }]
//                          },
//                          area: {
//                              identifier: 'area',
//                              rules: [{
//                                  type: 'empty',
//                                  prompt: 'Please select an area for this restaurant'
//                              }]
//                          }
//                      }, {
//                          on: 'blur',
//                          inline: 'true'
//                      });

                      $(".restaurant-type-selection").dropdown();
                      $(".restaurant-area-selection").dropdown();
                  },
                  error: function(error) {
                      alert("Error in finding grids. Reason: " + error.message);
                  }
              });
          },

          saveRestaurant: function() {
              var self = this;
              var name = $("#restaurantName").val();
              var type = $(".restaurant-type-selection").dropdown('get value');
              var address = $("#restaurantAddress").val();
              var telnum = $("#restaurantTelnum").val();
              var confirmNumber = $("#orderConfirmNumber").val();
              var managerName = $("#restaurantManager").val();
              var gridId = $(".restaurant-area-selection").dropdown('get value');
              var url = $("#restaurantWebsite").val();
              var yelpLink = $("#yelpLink").val();
              var description = $("#restaurantDescription").val();

              //TODO@Lian - Create a new restaurant model object, and put all the above values to the corresponding following field names:
              //TODO@Lian   - name, type, address, telnum, confirmNumber, managerName, gridId, url, yelpLink, description
              //TODO@Lian - Save the restaurant object (Refer to https://parse.com/docs/js/guide#objects-saving-objects)
              //TODO@Lian - In the success call back, prompt an alert view saying "Save restaurant successfully!" and then direct user back to manageRestaurant page,
              //TODO@Lian   and you should see one more restaurant is created in the dropdown
              var savedRestaurant = new RestaurantModel();

              savedRestaurant.save({
                name: name,
                type: type,
                address: address,
                telnum: telnum,
                confirmNumber: confirmNumber,
                managerName: managerName,
                gridId: {
                  __type: "Pointer",
                  className: "Grid",
                  objectId: gridId
                },
                url: url,
                yelpLink: yelpLink,
                description: description
              }, {
                success: function(savedRestaurant) {
                  alert('Save restaurant successfully!');
                  console.log(savedRestaurant.id);
                  window.location.href='#manageRestaurants';
                },
                error: function(savedRestaurant, error) {
                  alert('Failed to save restaurant, with error code: ' + error.message);
                }
              });
          }
      });
      return NewRestaurantView;

    });



