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
              var self = this;
              var restaurantId = this.options.id;
              if(restaurantId) {
                  var restaurantQuery = new Parse.Query(RestaurantModel);
                  restaurantQuery.get(restaurantId, {
                      success: function(restaurant) {
                          self.continueFindGridAndRender(restaurant);
                      },
                      error: function(error) {
                          alert("Error in finding restaurant. Reason: " + error.message);
                      }
                  });
              } else {
                  var restaurant = new RestaurantModel();
                  self.continueFindGridAndRender(restaurant);
              }
          },

          continueFindGridAndRender: function(restaurant) {
              var self = this;
              var gridQuery = new Parse.Query(GridModel);
              gridQuery.find({
                  success: function(grids) {
                      self.$el.html(self.template({grids: grids, restaurant: restaurant}));
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

                      if (restaurant.id) {
                          $(".restaurant-type-selection").dropdown('set selected', restaurant.get('type'));
                          $(".restaurant-area-selection").dropdown('set selected', restaurant.get('gridId').id);
                          $(".restaurant-type-selection").dropdown('set value', restaurant.get('type'));
                          $(".restaurant-area-selection").dropdown('set value', restaurant.get('gridId').id);

                      } else {
                          $(".restaurant-type-selection").dropdown();
                          $(".restaurant-area-selection").dropdown();
                      }

                  },
                  error: function(error) {
                      alert("Error in finding grids. Reason: " + error.message);
                  }
              });
          },

          saveRestaurant: function() {
              var self = this;
              var id = $("#restaurantId").val();
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

              var savedRestaurant = new RestaurantModel();
              if (id) {
                  savedRestaurant.id = id;
              }
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
                  window.location.href='#manageRestaurants';
                },
                error: function(savedRestaurant, error) {
                  alert('Failed to save restaurant, with error message: ' + error.message);
                }
              });
          }
      });
      return NewRestaurantView;

    });



