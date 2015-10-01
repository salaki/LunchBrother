define([
    'models/Grid',
    'text!templates/manage/newManagerTemplate.html'

    ], function (GridModel, newManagerTemplate) {

      var NewManagerView = Parse.View.extend({

          el: $("#page"),

          events: {
              'click .save-manager-btn': "saveManager"
          },

          initialize: function () {
            _.bindAll(this, 'render');
          },

          template: _.template(newManagerTemplate),

          render: function () {
              var self = this;
              var managerId = this.options.managerId;
              if(managerId) {
                  var managerQuery = new Parse.Query(Parse.User);
                  managerQuery.get(managerId, {
                      success: function(manager) {
                          self.continueFindGridAndRender(manager);
                      },
                      error: function(error) {
                          alert("Error in finding restaurant. Reason: " + error.message);
                      }
                  });
              } else {
                  self.continueFindGridAndRender(new Parse.User());
              }

            return this;

          },

          continueFindGridAndRender: function(manager) {
              var self = this;
              var gridQuery = new Parse.Query(GridModel);
              gridQuery.find({
                  success: function(grids) {
                      self.$el.html(self.template({grids: grids, manager: manager}));
                      $("#managerPhoto").change(self.handleFileSelect);

                      if (manager.get('gridId')) {
                          $(".manager-location-select").dropdown('set selected', manager.get('gridId').id);
                          $(".manager-location-select").dropdown('set value', manager.get('gridId').id);
                      } else {
                          $(".manager-location-select").dropdown();
                      }
                  },
                  error: function(error) {
                      alert("Error in finding grids. Reason: " + error.message);
                  }
              });
          },

          handleFileSelect: function(evt) {
              $(".managerPhotoPreviewRow").remove();

              var files = evt.target.files; // FileList object

              // Loop through the FileList and render image files as thumbnails.
              for (var i = 0, f; f = files[i]; i++) {

                  // Only process image files.
                  if (!f.type.match('image.*')) {
                      continue;
                  }

                  var reader = new FileReader();

                  // Closure to capture the file information.
                  reader.onload = (function(theFile) {
                      return function(e) {
                          // Render thumbnail.
                          $('.manager-photo-upload').after('<div class="managerPhotoPreviewRow">' +
                              '<img class="thumb" src="' + e.target.result + '" style="width: 200px"/>' +
                              '</div>');
                      };
                  })(f);

                  // Read in the image file as a data URL.
                  reader.readAsDataURL(f);
              }
          },

          saveManager: function() {
              var self = this;
              var managerId = this.options.managerId;
              var permission = LOCAL_MANAGER;
              var username = $("#manager-email").val();
              var password = $("#manager-password").val();
              var firstName = $("#manager-first-name").val();
              var lastName = $("#manager-last-name").val();
              var telnum = Number($("#manager-telnum").val());
              var email = $("#manager-email").val();
              var gridId = $(".manager-location-select").dropdown('get value');

              var fullName = $("#manager-first-name").val() + "_" + $("#manager-last-name").val();
              var managerPhotoFiles = $("#managerPhoto")[0];
              var imageFile = null;
              if (managerPhotoFiles.files.length > 0) {
                  var file = managerPhotoFiles.files[0];
                  imageFile = new Parse.File(fullName, file);
                  imageFile.save({
                      success: function (imageFile) {
                          self.continueSaveManager(managerId, username, password, firstName, lastName, email, telnum, permission, imageFile, gridId);
                      },
                      error: function (error) {
                          alert("Error: " + error.code + " " + error.message);
                      }
                  });
              } else {
                  this.continueSaveManager(managerId, username, password, firstName, lastName, email, telnum, permission, imageFile, gridId);
              }
          },

          continueSaveManager: function(managerId, username, password, firstName, lastName, email, telnum, permission, imageFile, gridId) {
              if (managerId) {
                  Parse.Cloud.run('updateUser', {
                      userId: managerId,
                      firstName: firstName,
                      lastName: lastName,
                      email: email,
                      telnum: telnum,
                      password: password,
                      permission: permission,
                      imageFile: imageFile,
                      gridId: gridId
                  }, {
                      success: function (success) {
                          alert("Save manager successfully!");
                          window.location.href = "#managerList";
                      },
                      error: function (error) {
                          alert("Error: " + error.code + " " + error.message);
                      }
                  });
              } else {
                  var manager = new Parse.User();
                  manager.set("permission", LOCAL_MANAGER);
                  manager.set("username", username);
                  manager.set("password", password);
                  manager.set("firstName", firstName);
                  manager.set("lastName", lastName);
                  manager.set("telnum", telnum);
                  manager.set("email", email);
                  manager.set("gridId", {
                      __type: "Pointer",
                      className: "Grid",
                      objectId: gridId
                  });
                  manager.set("creditBalance", 30);

                  if (imageFile) {
                      manager.set('imageFile', imageFile);
                  }

                  manager.save(null, {
                      success: function (manager) {
                          console.log("Save manager successfully!");
                          window.location.href = "#managerList";
                          //TODO email verification
                      },
                      error: function (error) {
                          console.log("Save manager failed! Reason: " + error.message);
                      }
                  });
              }
          }
      });
      return NewManagerView;

    });


