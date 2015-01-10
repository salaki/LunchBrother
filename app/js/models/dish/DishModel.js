define(function(){
  var DishModel = Parse.Object.extend("Dish", {
    defaults: {
      count: 0
    },
    
    initialize:function(){
      this.bind("change:count", this.countChangeHandler);
    },
    countChangeHandler:function(event){
      
    }
  });
  
  return DishModel;
});


  