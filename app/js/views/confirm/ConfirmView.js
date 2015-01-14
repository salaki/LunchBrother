define([
  'text!templates/confirm/confirmTemplate.html'
], function(confirmTemplate) {

  var ConfirmView = Parse.View.extend({
    tagName: "div",
    attributes: {
      class: 'column'
    },

    template: _.template(confirmTemplate),

    render: function() {
      this.$el.html(this.template());
    }
  });
  return ConfirmView;
});