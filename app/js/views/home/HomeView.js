define([
  'views/home/DishCollectionView',
  'models/dish/DishModel',
  'models/dish/DishCollection',
  'text!templates/home/homeTemplate.html'
], function(DishCollectionView, DishModel, DishCollection, homeTemplate) {

  var HomeView = Parse.View.extend({
    // tagName: 'ul', // required, but defaults to 'div' if not set
    el: $("#page"),

    template: _.template(homeTemplate),

    initialize: function() {

    },

    render: function() {
      var that = this;
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');

      this.$el.html(this.template());

      var today = new Date();
      var onejan = new Date(today.getFullYear(), 0, 1);
      var weekOfYear = Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      var dayOfWeek = today.getDay();
      if (dayOfWeek == 0 || dayOfWeek == 6) {
        dayOfWeek = 1;
        weekOfYear++;
      }
      if (weekOfYear % 2 == 0) {
        dayOfWeek += 5;
      }
      var bdQuery = new Parse.Query(DishModel);
      bdQuery.equalTo("Dish_Id", dayOfWeek);
      var comboQuery = new Parse.Query(DishModel);
      comboQuery.equalTo("Dish_Id", 11);

      var mainQuery = Parse.Query.or(bdQuery, comboQuery);
      mainQuery.find({
        success: function(results) {

          var dishCollectionView = new DishCollectionView({
            collection: results
          });
          that.$('#dishList').replaceWith(dishCollectionView.render().el);
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });

      return this;
    }
  });
  return HomeView;
});
