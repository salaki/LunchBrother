define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var DishModel = Backbone.Model.extend({

    defaults: {
      desc: ,
      img: '',
      price: ''
    },

    initialize: function(options) {
      this.query = options.query;
    },

    url: function() {
      return 'https://api.github.com/users/' + this.query;
    },

    parse: function(res) {
      // because of jsonp 
      return res.data;
    }

  });

  return DishModel;

});