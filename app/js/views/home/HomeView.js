define([
  'views/home/DishView',
  'views/order/OrderView',
  'models/dish/DishModel',
  'models/dish/DishCollection',
  'text!templates/home/homeTemplate.html',
  'text!templates/home/statsTemplate.html',
  'text!templates/order/orderTemplate.html'
], function(DishView, OrderView,DishModel, DishCollection, homeTemplate, statsTemplate,orderTemplate) {

  var HomeView = Parse.View.extend({
    // tagName: 'ul', // required, but defaults to 'div' if not set
    el: $("#page"),

    statsTemplate: _.template(statsTemplate),
    stats: {
      orders: [],
      totalCharge: 0
    },
    
    events: {
      'click #paymentBtn' : 'continuePay'
    },

    initialize: function() {

      _.bindAll(this, 'render', 'loadAll', 'addOne', 'continuePay');

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
      this.stats.orders = this.dishes.orders();
      this.stats.totalCharge = this.dishes.charge();
      
      this.$('#orderStats').html(this.statsTemplate(this.stats));

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
    },
    
    continuePay: function(){
      
      var view = new OrderView({
        model: this.stats
      });
      $("#dishTitle,#dishList,#paymentBtn,#orderMessage").hide();
      $("#page").append(view.render().el);
    }
  });
  return HomeView;
});
