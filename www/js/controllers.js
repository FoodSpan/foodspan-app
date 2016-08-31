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

.controller('PanelAddCtrl', function($scope, $state, Sync) {

  $scope.addPanel = function() {
    console.log("add panels");

    $state.go('tab.panels');
  };


})

.controller('PanelDetailCtrl', function($scope, $stateParams, Panels, $ionicModal) {
  $scope.panel = Panels.get($stateParams.panelId, function (panel){
    $scope.panel = panel;
  });
})

.controller('TagsCtrl', function($scope, Database, Sync) {

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = false;
  });

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

/*
  //enable back button
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
  });

  $rootScope.$ionicGoBack = function(backCount) {
    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    //$ionicNavBarDelegate.showBackButton(false);
    $state.go('tab.tags');
  };*/

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
