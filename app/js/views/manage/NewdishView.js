define([
    'models/dish/DishModel',
    'text!templates/manage/newdishTemplate.html'
], function (DishModel, newdishTemplate) {

    var NewdishView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(newdishTemplate),
  
        render: function () {
            var self = this;
            var dishId = this.options.id;
            if(dishId) {
                var dishQuery = new Parse.Query(DishModel);
                dishQuery.get(dishId, {
                    success: function(dish) {
                        console.log(dish);
                        self.$el.html(self.template({dish: dish}));
                    },
                    error: function(error) {
                        alert("Error in finding restaurant. Reason: " + error.message);
                    }
                });
            } else {
                var dish = new DishModel();
                this.$el.html(this.template({dish: dish}));
            }
        }
    });
    return NewdishView;
});


