define(function() {
  var OrderModel = Parse.Object.extend("Order", {
    defaults: {

    },
    validation: {
    name: {
      identifier  : 'first_name',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter your name'
        }
      ]
    },
    email: {
      identifier  : 'email',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please fill the emailr'
        }
      ]
    },
    terms: {
      identifier : 'terms',
      rules: [
        {
          type   : 'checked',
          prompt : 'You must agree to the terms and conditions'
        }
      ]
    }
    },
  });
  return OrderModel;
});