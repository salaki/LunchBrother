define(function(){
  var DishModel = Parse.Object.extend("Dish");
  return DishModel;
  /**
  var ImageModel = Parse.Object.extend("Image");
  //caculate the date to get the name
  var number;
  var dishModel = new DishModel();
  var dish_desc = dishModel.get("Description");
  var dish_image = dishModel.get("Image_Id");
  
  var queryName = new Parse.query(DishModel);
      queryName.equalTo("Name", 10);
      queryName.find({
        success:function(results){
          //do something with the returned Parse.Object value
           console.log(results);
        },
        error: function(error){
          alert("Error: " + error.code + " " + error.message);
        }
      });
  
  var queryImage = new Parse.query(ImageModel);
      queryImage.get(dish_image,{
        success:function(results){
          
        },
        error:function(error){
           alert("Error: " + error.code + " " + error.message);
        }
      });
  **/    
});
  