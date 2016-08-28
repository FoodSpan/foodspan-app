angular.module('foodspan', ['ionic', 'ngCordova', 'foodspan.controllers', 'foodspan.services'])

.run(function($ionicPlatform, $state) {
  //TODO add panel
  //TODO edit tag info
  //TODO no internet handling
  //TODO add pictures
  //TODO sorting
  //TODO remove tag
  //TODO remove panel
  $ionicPlatform.ready(function() {
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    document.addEventListener('deviceready', function() {
      var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

        db.executeSql('CREATE TABLE IF NOT EXISTS user (email, password, name)');
        db.executeSql('SELECT * FROM user', [], function (res){
            if (res.rows.length > 0){
              console.log ("to dash");
              $state.go('tab.dash');
            } else {
              console.log ("to login");
            }
          }, function (error) {
          console.log('transaction error: ' + error.message);
        })
      }, function (error) {
        console.log('Open database ERROR: ' + JSON.stringify(error));
      });
    });
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
  .state('tab.panel-detail', {
    url: '/panels/:panelId',
    views: {
      'tab-panels': {
        templateUrl: 'templates/panel-detail.html',
        controller: 'PanelDetailCtrl'
      }
    }
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
      }
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
