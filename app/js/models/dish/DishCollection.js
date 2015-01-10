define(['models/dish/DishModel'],
  function(DishModel) {
    var DishCollection = Parse.Collection.extend({
      model: DishModel
    });
    return DishCollection;
  });