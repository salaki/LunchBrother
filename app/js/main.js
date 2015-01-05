define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'semantic',
  'libs/semantic/dropdown.min'
], function($, _, Backbone, router) {
  var initialize = function() {
    console.log("main init");
    router.initialize();

    $('.ui.dropdown').dropdown();
    var cnDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    var today = new Date();
    var dayOfWeek = cnDay[today.getDay()];
    var date = today.toLocaleDateString();
    $('#today').text(dayOfWeek + ', ' + date);
  };

  return {
    initialize: initialize
  }
})