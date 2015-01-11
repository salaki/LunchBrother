define([
  'models/dish/DishModel',
  'text!templates/home/dishTemplate.html'
], function(DishModel, dishTemplate) {
  
  var DishView = Parse.View.extend({

    tagName: "div",
    attributes:{
      class: 'column'
    },
    
    template: _.template(dishTemplate),


    initialize: function() {
      _.bindAll(this,'render','quantityIncrease','quantityDecrease');
      this.model.bind('change',this.render);
      this.model.set("Count", 0);
    },
    
     events: {
      'click .plusone': 'quantityIncrease',
      'click .minusone': 'quantityDecrease'
    },
    
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.delegateEvents();
      return this;
    },
   
    quantityIncrease: function() {
     this.model.set("Count", this.model.get("Count") + 1);
     Parse.Events.trigger("collection:update");
    },

    quantityDecrease: function() {
     if(this.model.get("Count")<=0){
     }else{
        this.model.set("Count", this.model.get("Count") - 1);
       Parse.Events.trigger("collection:update");
     }
    },
  });
    return DishView;
});