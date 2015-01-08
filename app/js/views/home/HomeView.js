define([
  'views/home/DishView',
  'models/dish/DishModel',
  'models/image/ImageModel',
  'text!templates/home/homeTemplate.html'
], function(DishView, DishModel, ImageModel, homeTemplate) {

  var HomeView = Parse.View.extend({
    el: $("#page"),
    dishes: [],
    template: _.template(homeTemplate),

    render: function() {
      var that = this;
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      this.$el.html(this.template());
      
      var today = new Date();
      var onejan = new Date(today.getFullYear(),0,1);
      var weekOfYear = Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
      var dayOfWeek = today.getDay();
      if(dayOfWeek == 0 || dayOfWeek == 6){
        dayOfWeek = 1;
        weekOfYear ++;
      }
      if(weekOfYear%2 == 0){
        dayOfWeek += 5;
      }
      var bdQuery = new Parse.Query(DishModel);
      bdQuery.equalTo("Dish_Id", dayOfWeek);
      var comboQuery = new Parse.Query(DishModel);
      comboQuery.equalTo("Dish_Id", 11);
      
      var mainQuery = Parse.Query.or(bdQuery, comboQuery);
      mainQuery.find({
        success: function(results) {
          var dishListHtml = "";
          for (var i = 0; i < results.length; i++) {
            var dish = results[i];
            that.dishes.push(dish);
            var dishView = new DishView({
              model: dish
            });
            dishListHtml += dishView.render().$el.html();
          }
          that.$el.find('#dishList').html(dishListHtml);
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    }
  });
  return HomeView;
});
