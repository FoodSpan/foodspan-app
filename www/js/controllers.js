angular.module('foodspan.controllers', [])

.controller('LoginCtrl', function($scope, $state) {
  $scope.login = function(user) {
    console.log('Log-in', user);
    $state.go('tab.dash');
  };
})

.controller('DashCtrl', function($scope, Tags) {
  $scope.tags = Tags.all();
})

.controller('PanelsCtrl', function($scope, Panels) {
  $scope.panels = Panels.all();
})

.controller('PanelDetailCtrl', function($scope, $stateParams, Panels, $ionicModal) {
  $scope.panel = Panels.get($stateParams.panelId);
})

.controller('TagsCtrl', function($scope, Tags) {
  $scope.tags = Tags.all();
})

.controller('TagDetailCtrl', function($scope, $stateParams, Tags, $ionicModal) {
  $scope.tag = Tags.get($stateParams.tagId);
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

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    enableNotifications: true
  };
});
