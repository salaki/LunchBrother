define([
  'models/dish/DishCollection',
  'models/order/OrderModel',
  'models/order/PaymentModel',
  'views/home/DishCollectionView',
  'views/confirm/ConfirmView',
  'views/confirm/TextView',
  'text!templates/home/statsTemplate.html',
  'text!templates/order/orderTemplate.html',
  'stripe',
  'libs/semantic/checkbox.min',
  'libs/semantic/form.min'
], function(DishCollection, OrderModel, PaymentModel, DishCollectionView, ConfirmView, TextView, statsTemplate, orderTemplate, Stripe) {
  Stripe.setPublishableKey('pk_test_O2hEo1UfnNPrEctKfUOd6Zay');
  var OrderView = Parse.View.extend({

    tagName: "div",

    attributes: {
      class: 'column'
    },

    template: _.template(orderTemplate),

    events: {
      'submit #paymentForm': 'orderSubmit'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'stripeResponseHandler', 'orderSubmit');
      Stripe.setPublishableKey('pk_test_O2hEo1UfnNPrEctKfUOd6Zay');
    },

    render: function() {
      $(this.el).html(this.template());
      this.$('.ui.checkbox').checkbox();
      this.$('select.dropdown').dropdown();
      this.$('.ui.form').form({
        'first_name': {
          identifier: 'first_name',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your first name'
          }]
        },
        'last_name': {
          identifier: 'last_name',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your last name'
          }]
        },
        email: {
          identifier: 'email',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your e-mail'
          }, {
            type: 'email',
            prompt: 'Please enter a valid e-mail'
          }]
        },
        address: {
          identifier: 'address',
          rules: [{
            type: 'empty',
            prompt: 'Please select a location'
          }]
        },
        terms: {
          identifier: 'terms',
          rules: [{
            type: 'checked',
            prompt: 'You must agree to the terms and conditions'
          }]
        }
      }, {
        on: 'blur',
        inline: 'true'
      });
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
        var paymentDetails = new PaymentModel();
        //

        var fname = $('#first_name').val();
        var lname = $('#last_name').val();
        var email = $('#email').val();
        var address = $('#addressdetails option:selected').text();
        var stripepayment = self.model.totalCharge;
        var i = 1;
        _.each(self.model.orders, function(order) {
          var dishName = order.get('Description');
          var quantity = order.get('count');
          paymentDetails.set('dishName' + i, dishName);
          paymentDetails.set('quantity' + i, quantity);
          i++;
        });

        this.customerorderId = paymentDetails.get('orderId');

        paymentDetails.set('fname', fname);
        paymentDetails.set('lname', lname);
        paymentDetails.set('email', email);
        paymentDetails.set('stripeToken', token);
        paymentDetails.set('address', address);
        paymentDetails.set('totalPrice', stripepayment);
        paymentDetails.set('paymentCheck', false);
        paymentDetails.save(null, {
          success: function(paymentDetails) {
            var view1 = new TextView({
              model: paymentDetails
            });
            var view2 = new ConfirmView({
              model: paymentDetails
            });
            $("#paymentForm").remove();
            $("#page").prepend(view1.render().el);
            $("#page").append(view2.render().el);
            

            Parse.Cloud.run('pay', {
              orderId: paymentDetails.get('orderId')
            }, {
              success: function(amount) {

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
      e.preventDefault();
      var $form = this.$('form');
      $form.find('#orderBtn').prop('disabled', true);
      Stripe.card.createToken($form, this.stripeResponseHandler);
    }
  });
  return OrderView;
});