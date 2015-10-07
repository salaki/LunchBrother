define([
    'stripe',
    'models/Restaurant',
    'models/Grid',
    'models/BankAccount',
    'text!templates/manage/newRestaurantTemplate.html'

    ], function (Stripe, RestaurantModel, GridModel, BankAccountModel, newRestaurantTemplate) {

      var NewRestaurantView = Parse.View.extend({
          el: $("#page"),

          template: _.template(newRestaurantTemplate),

          events: {
              'click #saveRestaurantBtn': 'saveRestaurant'
          },

          initialize: function () {
            _.bindAll(this, 'render', 'saveRestaurant');
              Stripe.setPublishableKey('pk_test_pb95pxk797ZxEFRk55wswMRk');
          },

          render: function () {
              var self = this;
              var restaurantId = this.options.id;
              if(restaurantId) {
                  var restaurantQuery = new Parse.Query(RestaurantModel);
                  restaurantQuery.include('bankAccount');
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
                      var bankAccount = new BankAccountModel();

                      if (restaurant.get('bankAccount')) {
                          bankAccount = restaurant.get('bankAccount')
                      }

                      self.$el.html(self.template({grids: grids, restaurant: restaurant, bankAccount: bankAccount}));
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
              var email = $("#restaurantEmail").val();
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
                  email: email,
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
                    $("#restaurantId").val(savedRestaurant.id);
                    self.createBankAccount();
                },
                error: function(savedRestaurant, error) {
                  alert('Failed to save restaurant, with error message: ' + error.message);
                }
              });
          },

          createBankAccount: function() {
              if (this.validateBankFields()) {
                  var $form = this.$('form');
                  Stripe.bankAccount.createToken($form, this.stripeResponseHandler);
              }
          },

          stripeResponseHandler: function(status, response) {
              var $form = $('#restaurantForm');

              if (response.error) {
                  // Show the errors on the form
                  alert(response.error.message);
                  $form.find('.bank-errors').text(response.error.message);
                  $form.find('button').prop('disabled', false);
              } else {
                  var token = response.id;
                  var accountNumber = $(".restaurant-account-number").val();
                  var routingNumber = $(".restaurant-routing-number").val();
                  var last4DigitForAccountNumber = $(".restaurant-account-number").val().slice(-4);
                  var restaurantId = $("#restaurantId").val();

                  Parse.Cloud.run('saveRecipient', {
                      name: $("#restaurantName").val(),
                      type: 'corporation',
                      bankAccount: token,
                      accountNumber: accountNumber,
                      routingNumber: routingNumber,
                      last4DigitForAccountNumber: last4DigitForAccountNumber,
                      email: $("#restaurantEmail").val(),
                      createdById: restaurantId
                  }, {
                      success: function (response) {
                          var restaurant = new RestaurantModel();
                          restaurant.id = restaurantId;
                          restaurant.set('bankAccount', response);
                          restaurant.save();
                          alert("Bank account created successfully!");
                          window.location.href='#manageRestaurants';
                      },
                      error: function(error) {
                          alert("Oops, something went wrong! Please check your account number and routing number then try again.");
                          console.log(error.message);
                      }
                  });
              }
          },

          validateBankFields: function() {
              //TODO - Also need to check if the same as original and modify/create recipient
              var hasBankInfo = false;
              var accountNumber = $(".restaurant-account-number").val();
              var routingNumber = $(".restaurant-routing-number").val();
              if (accountNumber.trim() !== "" && routingNumber.trim() !== "") {
                  hasBankInfo = true;
              }
              return hasBankInfo;
          }

      });
      return NewRestaurantView;

    });



