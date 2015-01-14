define([
  'models/dish/DishCollection',
  'models/order/OrderModel',
  'models/order/PaymentModel',
  'views/home/DishCollectionView',
  'text!templates/home/statsTemplate.html',
  'text!templates/order/orderTemplate.html',
  'stripe',
  'libs/semantic/checkbox.min'
], function(DishCollection, OrderModel, PaymentModel, DishCollectionView, statsTemplate, orderTemplate, Stripe) {
  Stripe.setPublishableKey('pk_test_EMIAzyTdHHJaFEnWTNchuOTZ');
  var OrderView = Parse.View.extend({
    tagName: "div",
    attributes: {
      class: 'column'
    },

    template: _.template(orderTemplate),

    events: {
      'click #orderBtn': 'orderSubmit',
      'change input': 'fieldChanged',
      'change select': 'selectionChanged'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'stripeResponseHandler', 'orderSubmit', 'selectionChanged','fieldChanged');
      Stripe.setPublishableKey('pk_test_EMIAzyTdHHJaFEnWTNchuOTZ');
      Parse.Events.on('final:update', this.getAmount, this);
    },

    render: function() {
      $(this.el).html(this.template());
      this.$('.ui.checkbox').checkbox();
      this.$('select.dropdown').dropdown();
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
        var paymentDetails = new PaymentModel();
        var name = $form.find('input[name="first_name"]').text();
        var stripepayment = self.model.totalCharge * 100;

        //name: get card name from input 
        paymentDetails.set('name', name);
        paymentDetails.set('stripeToken', token);
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
    },

    selectionChanged: function(e) {
      var field = $(e.currentTarget);
      var value = $("option:selected", field).val();
      var data = {};
      data[field.attr('id')] = value;
      this.model.set(data);
    },
    
    fieldChanged: function(e) {
      var field = $(e.currentTarget);
      var data = {};
      data[field.attr('id')] = field.val();
      this.model.set(data);
    }

  });
  return OrderView;
});