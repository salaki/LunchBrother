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
    },
    
     events: {
      'click button#plusone': 'quantityIncrease',
      'click button#minusone': 'quantityDecrease'
    },
    
    render: function() {
      
      this.$el.html(this.template(this.model.toJSON()));
      this.delegateEvents();
      return this;
    },
   
    quantityIncrease: function() {
     var newCount = this.model.get('Count');
     newCount++;
     this.model.set('Count',newCount);
     document.getElementById('counter').innerHtml=newCount;
     alert('Quantity:' + newCount);
    
      // // var button = document.getElementById('plusone');
      // // 
      // // button.onclick = function(e) {
      // //   //count++;
      // //   //
      // //   
      // };
      this.render();
    },

    quantityDecrease: function() {
        
       var newCount = this.model.get('Count');
        if (newCount<=0) {
            alert("Please provide a positive quantity number");
        }
        else {
          newCount--;
          this.model.set('Count',newCount);
          alert('Quantity:' + newCount);
          }
      this.render();
    },
  });
    return DishView;
});