angular.module('foodspan.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, $ionicPopup) {

  $scope.loginData = {};

  $scope.badLoginPopup = function (){
    var alertPopup = $ionicPopup.alert({
         title: 'Invalid Credentials!',
         template: 'Are you sure you typed them in correctly?'
      });

      alertPopup.then(function(res) {
         // Custom functionality....
      });
  };

  $scope.login = function(user) {

    var link = 'https://www.foodspan.ca/webspan/endpoint.php';

    var data = {
      email:$scope.loginData.email,
      password:$scope.loginData.password,
      a_function:"login",
      parameter:""
    }

    $http.post(link, data).then(function (res){
      console.log ("server response:" + res.data['password']);

      if (res.data == "bad_credentials"){
        $scope.badLoginPopup();

      } else {
        document.addEventListener('deviceready', function() {
          var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

            db.transaction(function (tx) {
              tx.executeSql('DELETE FROM USER');
              tx.executeSql('INSERT INTO user (email, password, name) VALUES (?, ?, ?)',
              [$scope.loginData.email, res.data['password'], res.data['name']]);

              $state.go('tab.dash');
            }, function (error) {
              console.log('transaction error: ' + error.message);
            }, function () {
              console.log('login - transaction ok');
            });
          }, function (error) {
            console.log('Open database ERROR: ' + JSON.stringify(error));
          });
        });
      }
    }, (function (res){
      console.log("login - connection failed");
    }));
  };
})

.controller('DashCtrl', function(Database, Sync, $scope, $http) {

  //TODO disable back button to logout

  document.addEventListener('deviceready', function() {

    $scope.dashData = {};

    $scope.dashData.date = new Date();

    Sync.now(function () {

      Database.getUser(function (userData) {

        $scope.dashData.nameDisplay = userData.name;
      });

      Database.getPanels(function (panelData) {

        $scope.dashData.cpCount = panelData.length;
      });

      Database.getTags(function (tagData) {

        $scope.dashData.tagCount = tagData.length;

        var spoilingTags = [];

        //display only tags that are spoiling soon

        for (var i = 0; i < tagData.length; i++){
          if (tagData[i].status === "Spoiling Soon"){
            spoilingtags.push(tagData[i].status);
          }
        }

        $scope.dashData.tags = spoilingTags;

        $scope.$apply();
      });
    });
    //TODO block actions until done syncing
  });
})

.controller('PanelsCtrl', function($scope, Database) {
  console.log("PanelCtrl init");

  Database.getPanels(function (panelData) {
    $scope.panels = panelData;

    $scope.$apply();
    //TODO REFRESH
  });
})

.controller('PanelDetailCtrl', function($scope, $stateParams, Panels, $ionicModal) {
  $scope.panel = Panels.get($stateParams.panelId, function (panel){
    $scope.panel = panel;
  });
})

.controller('TagsCtrl', function($scope, Database) {

  Database.getTags(function (tagData) {

    $scope.tags = tagData;

    $scope.$apply();
  });
})

.controller('TagDetailCtrl', function($scope, $stateParams, Tags, $ionicModal) {
  Tags.get($stateParams.tagId, function (tag){
    $scope.tag = tag;
  });
  /* | MODAL CODE |
  $ionicModal.fromTemplateUrl('templates/tag-detail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  */
})

.controller('SettingsCtrl', function($scope, $state, Database) {
  $scope.settings = {
    enableNotifications: true
  };

  $scope.logout = function() {
    Database.logout(function (){
      $state.go('login');
    });
  };
});
