define([
  'models/dish/DishCollection',
  'models/order/OrderModel',
  'models/order/PaymentModel',
  'views/home/DishCollectionView',
  'views/confirm/ConfirmView',
  'text!templates/home/statsTemplate.html',
  'text!templates/order/orderTemplate.html',
  'stripe',
  'libs/semantic/checkbox.min'
], function(DishCollection, OrderModel, PaymentModel, DishCollectionView, ConfirmView, statsTemplate, orderTemplate, Stripe) {
  Stripe.setPublishableKey('pk_test_EMIAzyTdHHJaFEnWTNchuOTZ');
  var OrderView = Parse.View.extend({
    tagName: "div",
    attributes: {
      class: 'column'
    },

    template: _.template(orderTemplate),

    events: {
      'click #orderBtn': 'orderSubmit'


    },

    initialize: function() {
      _.bindAll(this, 'render', 'stripeResponseHandler', 'orderSubmit');
      Stripe.setPublishableKey('pk_test_EMIAzyTdHHJaFEnWTNchuOTZ');

    },

    render: function() {
      $(this.el).html(this.template());
      this.$('.ui.checkbox').checkbox();
      this.$('select.dropdown').dropdown();
      this.$('form').form({
        fname: {
          identifier: 'first_name',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your first name'
          }]
        },
        lname: {
          identifier: 'last_name',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your last name'
          }]
        },
        email: {
          identifier: 'email',
          rules: [{
            type: 'email',
            prompt: 'Please enter a valid e-mail'
          }]
        },
        address: {
          identifier: 'address',
          rules: [{
            type: 'empty',
            prompt: 'Please select an address'
          }]
        },
        terms: {
          identifier: 'terms',
          rules: [{
            type: 'checked',
            prompt: 'You must agree to the terms and conditions'
          }]
        }
      });
      this.$('form').submit(this.orderSubmit);
      return this;
    },

    stripeResponseHandler: function(status, response) {
      var $form = $('#paymentForm');
      var self = this;

      if (response.error) {
        // Show the errors on the form
        $form.find('.payment-errors').text(response.error.message);
        $('#orderBtn').prop('disabled', false);
      }
      else { // No errors, submit the form.
        // Get the token from the response:
        var token = response.id;
        var paymentDetails = new PaymentModel({
          validation:{
             fname: {
          identifier: 'first_name',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your first name'
          }]
        },
        lname: {
          identifier: 'last_name',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your last name'
          }]
        },
        email: {
          identifier: 'email',
          rules: [{
            type: 'email',
            prompt: 'Please enter a valid e-mail'
          }]
        },
        address: {
          identifier: 'address',
          rules: [{
            type: 'empty',
            prompt: 'Please select an address'
          }]
        },
        terms: {
          identifier: 'terms',
          rules: [{
            type: 'checked',
            prompt: 'You must agree to the terms and conditions'
          }]
        }
          }
        });
        //
        var fname = $('#first_name').val();
        var lname = $('#last_name').val();
        var email = $('#email').val();
        var address = $('#addressdetails option:selected').text();
        var stripepayment = self.model.totalCharge * 100;


        //name: get card name from input 
        // paymentDetails.set('fname', fname);

        paymentDetails.set('fname', fname);
        paymentDetails.set('lname', lname);
        paymentDetails.set('email', email);
        paymentDetails.set('stripeToken', token);
        paymentDetails.set('address', address);
        paymentDetails.save(null, {
          success: function(paymentDetails) {
            Parse.Cloud.run('pay', {
              amount: stripepayment,
              stripeToken: token
            }, {
              success: function(amount) {
                //save
                alert('Success: ' + amount);
              },
              error: function(error) {
                console.log(error);
              }
            });
          },
          error: function(payment, error) {
            alert('Failed to create new object, with error code: ' + error.message);
          }
        });
      }
    },

    orderSubmit: function(e) {
      var $form = this.$('form');
      $form.find('#orderBtn').prop('disabled', true);
      Stripe.card.createToken($form, this.stripeResponseHandler);
      var view = new ConfirmView();
      $("#paymentForm").hide();
      $("#page").append(view.render().el);
    },
  });
  return OrderView;
});