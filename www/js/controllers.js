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

.controller('DashCtrl', function($ionicPlatform, Database, Sync, $scope, $http) {

  //disable back button to logout
  $ionicPlatform.registerBackButtonAction(function () {
}, 100);

  $scope.refreshDash = function(){

    document.addEventListener('deviceready', function() {

      $scope.dashData = {};

      $scope.dashData.date = new Date();

        Sync.now(function () {

        Database.getUser(function (userData) {

          $scope.dashData.nameDisplay = userData.name;

          $scope.$apply();
        });

        Database.getPanels(function (panelData) {

          $scope.dashData.cpCount = panelData.length;

          $scope.$apply();

          $scope.$broadcast('scroll.refreshComplete');
        });

        Database.getTags(function (tagData) {

          $scope.dashData.tagCount = tagData.length;

          var spoilingTags = [];

          //display only tags that are spoiling soon

          for (var i = 0; i < tagData.length; i++){
            if (tagData[i].status == "Spoiling Soon"){
              spoilingTags.push(tagData[i]);
            }
          }

          $scope.dashData.tags = spoilingTags;

          $scope.$apply();
        });
      });
    });
  }

  $scope.refreshDash();
})

.controller('PanelsCtrl', function($scope, Database, Sync) {

  $scope.noPanels = true;

  function getPanels() {
    Database.getPanels(function (panelData) {

      if (panelData.length == 0){
        $scope.noPanels = false;
      } else {
        $scope.noPanels = true;
      }

      $scope.panels = panelData;

      $scope.$apply();
    });
  }

  $scope.refreshPanels = function(){
    Sync.now(function () {
      getPanels();
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  getPanels();
})

.controller('PanelDetailCtrl', function($scope, $stateParams, Panels, $ionicModal) {
  $scope.panel = Panels.get($stateParams.panelId, function (panel){
    $scope.panel = panel;
  });
})

.controller('TagsCtrl', function($scope, Database, Sync) {

  $scope.noTags = true;

  function getTags(){
    Database.getTags(function (tagData) {
      if (tagData.length == 0){
        $scope.noTags = false;
      } else {
        $scope.noTags = true;
      }

      $scope.tags = tagData;

      $scope.$apply();
    });
  }

  $scope.refreshTags = function() {
    Sync.now(function () {
      getTags();
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  getTags();

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

.controller('SettingsCtrl', function($scope, $state, $ionicHistory, Database) {
  $scope.settings = {
    enableNotifications: true
  };

  $scope.logout = function() {
    Database.logout(function (){
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('login');
    });
  };
});
