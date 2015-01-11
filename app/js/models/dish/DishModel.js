define(function(){
  var DishModel = Parse.Object.extend("Dish", {
    defaults: {
      count: 0
    },
    
    initialize:function(){
      this.on('error',this.handle_error);
      this.on('change:count',this.count_change);
    },
    
    addOne:function(){
      return this.model.get('count') + 1;
    },
    
    minusOne:function(){
      if(this.model.count<=0){
        alert("please provide a positive number");
      }else{
      return this.model.get('count') - 1;
      }
    },
    
  });
  return DishModel;
});


  