define([
    'stripe',
  'text!templates/manage/bankTemplate.html'
], function (Stripe, bankTemplate) {

    var BankView = Parse.View.extend({
        el: $("#page"),

        events: {
            'submit #bankForm': 'saveBankAccount'
        },

        initialize: function () {
            _.bindAll(this, 'render', 'saveBankAccount', 'stripeResponseHandler');
            Stripe.setPublishableKey('pk_test_pb95pxk797ZxEFRk55wswMRk');
        },

        template: _.template(bankTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        saveBankAccount: function(e) {
            e.preventDefault();
            var $form = this.$('form');
            //Disable the button
            $('#bankBtn').removeClass('red').addClass('grey');
            $('#bankBtn').prop('disabled', true);

            Stripe.bankAccount.createToken($form, this.stripeResponseHandler);
        },

        stripeResponseHandler: function(status, response) {
            var $form = $('#bankForm');

            if (response.error) {
                // Show the errors on the form
                alert(response.error.message);
                $form.find('.bank-errors').text(response.error.message);
                $form.find('button').prop('disabled', false);
            } else {
                // response contains id and bank_account, which contains additional bank account details
                var token = response.id;
                // Insert the token into the form so it gets submitted to the server
                //$form.append($('<input type="hidden" name="stripeToken" />').val(token));
                // and submit
                //$form.get(0).submit();
                var last4DigitForAccountNumber = $(".account-number").val().slice(-4);
                var currentUser = Parse.User.current();

                Parse.Cloud.run('saveRecipient', {
                    name: currentUser.get('firstName') + " " + currentUser.get('lastName'),
                    type: 'individual',
                    bankAccount: token,
                    last4DigitForAccountNumber: last4DigitForAccountNumber,
                    email: currentUser.get('email')
                }, {
                    success: function (response) {
                        console.log(response);
                        alert("Bank account created successfully!");
                        window.location.href = '#managerHome?week=';

                    },
                    error: function(error) {
                        alert("Oops, something went wrong! Please check your account number and routing number then try again.");
                        console.log(error);
                    }
                });
            }
        }
    });
    return BankView;
});

