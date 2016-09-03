angular.module('foodspan.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, $ionicPopup, Database, Sync) {

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

  $scope.noConnectionPopup = function (){
    var alertPopup = $ionicPopup.alert({
         title: 'Cannot connect to server!',
         template: 'Please verify your internet connection!'
      });

      alertPopup.then(function(res) {
         // Custom functionality....
      });
  };

  Database.checkLogin(function (success){
    console.log("checking if logged in");
    if (success == 1){
      $state.go('tab.dash');
    } else if (success == 0){
      $scope.noConnectionPopup();
    }
  });

  $scope.login = function(user) {

    Sync.login($scope.loginData.email, $scope.loginData.password, function(code){
      if (code == 0){
        $scope.noConnectionPopup();
      } else if (code == 1){
        $state.go('tab.dash');
      } else {
        $scope.badLoginPopup();
      }
    })
  };
})

.controller('DashCtrl', function($rootScope, $ionicHistory, $location, $state, $stateParams, $ionicPlatform, Database, Tags, Sync, $scope, $http) {

  if (navigator.connection.type == Connection.NONE){
    console.log("no connection");
    $rootScope.noInternet = true;
  } else {
    console.log("yes connection");
    $rootScope.noInternet = false;
  }

  document.addEventListener("offline", function(){

    //TODO disable all syncing

    $rootScope.noInternet = true;

    $scope.$apply();

    console.log("lost connection");

  }, false);
  document.addEventListener("online", function(){

    $rootScope.noInternet = false;

    $scope.$apply();

    console.log("gained connection");

  }, false);

  //disable back button to logout
  $ionicPlatform.registerBackButtonAction(function () {

  }, 100);

  $scope.viewTag = function(tagId){
    $location.path('/tab/tags/' + tagId);
  };

  $rootScope.refreshDash = function(){

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

        Database.getTags(null, function (tagData) {

          $scope.dashData.tagCount = tagData.length;

          var spoilingTags = [];

          //display only tags that are spoiling soon

          for (var i = 0; i < tagData.length; i++){
            if (tagData[i].status == "Spoiling Soon"){
              spoilingTags.push(tagData[i]);
            }
          }

          $scope.dashData.tags = spoilingTags;

          if (spoilingTags.length > 0){
            $scope.spoiling = true;
          } else {
            $scope.spoiling = false;
          }

          $scope.$apply();
        });
      });
    });
  }

  $scope.refreshDash();
})

.controller('PanelsCtrl', function($scope, $rootScope, Database, Sync) {

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

  $rootScope.refreshPanels = function(){
    Sync.now(function () {
      getPanels();
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  getPanels();
})

.controller('PanelAddCtrl', function($scope, $rootScope, $ionicPopup, $state, Sync) {

  $scope.badIDPopup = function (){
    var alertPopup = $ionicPopup.alert({
         title: 'Invalid Panel ID!',
         template: 'Are you sure you typed it in correctly?'
      });

      alertPopup.then(function(res) {
         // Custom functionality....
      });
  };

  $scope.panelData = [];

  $scope.addPanel = function() {
    console.log("add panels");
    Sync.addPanel($scope.panelData.alphaId, function(success){
      if (success){
        //TODO refresh panels
        $rootScope.refreshPanels();
        $state.go('tab.panels');
      } else {
        $scope.badIDPopup();
        //TODO error message, try again
        console.log("add panel failed");
      }
    })
  };


})

.controller('PanelDetailCtrl', function($scope, $stateParams, Panels, Tags, Database, $ionicModal) {

  $scope.panel = Panels.get($stateParams.panelId, function (panel){
    $scope.panel = panel;

    Database.getTags($scope.panel['actual_id'], function(tagData){
      $scope.panelTags = tagData;

      if (tagData.length > 0){
        $scope.panelNoTags = true;
      } else {
        $scope.panelNoTags = false;
      }
    });
  });
})

.controller('TagsCtrl', function($scope, $rootScope, Database, Sync) {

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
  });

  $scope.noTags = true;

  function getTags(){
    Database.getTags(null, function (tagData) {
      if (tagData.length == 0){
        $scope.noTags = false;
      } else {
        $scope.noTags = true;
      }

      $scope.tags = tagData;

      $scope.$apply();
    });
  }

  $rootScope.refreshTags = function() {
    Sync.now(function () {
      getTags();
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  getTags();

})

.controller('TagDetailCtrl', function($scope, $ionicNavBarDelegate, $rootScope, $stateParams, Tags, $ionicModal, $ionicHistory, $state) {
  $ionicNavBarDelegate.showBackButton();

  Tags.get($stateParams.tagId, function (tag){
    $scope.tag = tag;
  });

    var oldSoftBack = $rootScope.$ionicGoBack;

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
    $ionicNavBarDelegate.showBackButton(true);

    $rootScope.$ionicGoBack = function() {
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('tab.tags');
    };
  });

  $scope.$on('$ionicView.leave', function (event, viewData) {
      viewData.enableBack = true;
      $rootScope.$ionicGoBack = oldSoftBack;
  });
})

.controller('TagEditCtrl', function($scope, $state, $rootScope, $stateParams, $ionicPopup, Tags, Sync){

  $scope.uhOhPopup = function (){
    var alertPopup = $ionicPopup.alert({
         title: 'Uh oh!',
         template: 'Something went wrong!'
      });

      alertPopup.then(function(res) {
         // Custom functionality....
      });
  };

  Tags.get($stateParams.tagId, function (tag){
    $scope.tag = tag;

    $scope.tag.raw_cooked = (tag.raw_cooked == 0) ? false: true;

    $scope.tag.storage = (tag.storage == "Refrigerated") ? false: true;
  });

  $scope.editTag = function(toDelete){
      console.log($scope.tag.expiry);

      $scope.tag.raw_cooked = (!$scope.tag.raw_cooked) ? 0: 1;

      $scope.tag.storage = (!$scope.tag.storage) ? 0: 1;

      Sync.editTag($scope.tag, toDelete, function(success){
        if (success){
          try {
            $rootScope.refreshTags();
          } catch (err){
            //do nothing
          }
          $rootScope.refreshDash();
          //TODO REFRESH AND GO BACK TO MENU
          $state.go('tab.tags');
          console.log("success");
        } else {
          $scope.uhOhPopup();
        }
      });
  };
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
