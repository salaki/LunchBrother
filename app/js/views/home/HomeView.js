define([
  'views/home/DishView',
  'models/dish/DishModel',
  'models/dish/DishCollection',
  'text!templates/home/homeTemplate.html',
  'text!templates/home/statsTemplate.html'
], function(DishView, DishModel, DishCollection, homeTemplate, statsTemplate) {

  var HomeView = Parse.View.extend({
    // tagName: 'ul', // required, but defaults to 'div' if not set
    el: $("#page"),

    statsTemplate: _.template(statsTemplate),

    initialize: function() {
      var that = this;

      _.bindAll(this, 'render', 'loadAll', 'addOne');

      this.$el.html(_.template(homeTemplate)());

      this.dishes = new DishCollection;

      var bdQuery = new Parse.Query(DishModel);
      bdQuery.equalTo("Dish_Id", this.getDishId());
      var comboQuery = new Parse.Query(DishModel);
      comboQuery.equalTo("Dish_Id", 11);

      var mainQuery = Parse.Query.or(bdQuery, comboQuery);

      this.dishes.query = mainQuery;

      this.dishes.bind('reset', this.loadAll);
      this.dishes.bind('all', this.render);

      this.dishes.fetch();
    },

    render: function() {
      /*$('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');*/

      var orders = this.dishes.orders();
      var totalCharge = this.dishes.charge();
      
      this.$('#orderStats').html(this.statsTemplate({
        orders: orders,
        totalCharge: totalCharge
      }));

      this.delegateEvents();

      return this;
    },

    getDishId: function() {
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
      return dayOfWeek;
    },
    addOne: function(dish) {
      var view = new DishView({
        model: dish
      });
      this.$("#dishList").append(view.render().el);
    },
    loadAll: function(collection, filter) {
      this.$("#dishList").html("");
      this.dishes.each(this.addOne);
    }
  });
  return HomeView;
});
