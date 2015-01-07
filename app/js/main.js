define([
  'router',
  'semantic',
  'libs/semantic/dropdown.min'
], function(router) {
  var initialize = function() {
    console.log("main init");
    
    var appId = 'shB8up4c14Idr6eFH4SBjzqZ1vdYT0Q79LSaPQwT';
    var jsKey = 'PQrHeggtLnjUfFh4KI1IV5vLhZXztUzfdlUnk5X2';

    Parse.initialize(appId, jsKey);
    
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
