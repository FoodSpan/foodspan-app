angular.module('foodspan', ['ionic', 'ngCordova', 'foodspan.controllers', 'foodspan.services', 'ion-datetime-picker'])

.run(function($ionicPlatform, $state) {
  //IMPORTANT
  //TODO add panel name and description
  //TODO remove panel
  //TODO expiry date prediction
  //NOT IMPORTANT
  //TODO sorting
  //TODO get by category?
  //TODO fix clock
  //TODO fix redirect
  //TODO add back of panel ID code indication picture
  $ionicPlatform.ready(function() {
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login-page.html',
    controller: 'LoginCtrl'
  })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
  .state('tab.panels', {
    url: '/panels',
    views: {
      'tab-panels': {
        templateUrl: 'templates/tab-panels.html',
        controller: 'PanelsCtrl'
      }
    }
  })
  .state('tab.panel-add', {
    url: '/panels/add',
    views: {
      'tab-panels': {
        templateUrl: 'templates/panel-add.html',
        controller: 'PanelAddCtrl'
      }
    }
  })
  .state('tab.panel-detail', {
    url: '/panels/:panelId',
    views: {
      'tab-panels': {
        templateUrl: 'templates/panel-detail.html',
        controller: 'PanelDetailCtrl'
      }
    },
    cache:false
  })
  .state('tab.tags', {
      url: '/tags',
      views: {
        'tab-tags': {
          templateUrl: 'templates/tab-tags.html',
          controller: 'TagsCtrl'
        }
      }
    })
    .state('tab.tag-detail', {
      url: '/tags/:tagId',
      views: {
        'tab-tags': {
          templateUrl: 'templates/tag-detail.html',
          controller: 'TagDetailCtrl'
        }
      },
      cache:false
    })
    .state('tab.tag-edit', {
      url: '/tags/edit/:tagId',
      views: {
        'tab-tags': {
          templateUrl: 'templates/tag-edit.html',
          controller: 'TagEditCtrl'
        }
      },
      cache:false
    })
  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
