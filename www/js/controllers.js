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

    var link = 'http://matthewwang.me/webspan/endpoint.php';

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
              console.log('transaction ok');
            });

          }, function (error) {
            console.log('Open database ERROR: ' + JSON.stringify(error));
          });
        });
      }
    }, (function (res){
      console.log("connection failed");
    }));

    //console.log('Log-in', user);
  };
})

.controller('DashCtrl', function($scope, $http, Tags) {

  $scope.userData = {};

  $scope.date = new Date();

  document.addEventListener('deviceready', function() {
    var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

      //get name
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM user', [], function (tx, res){
          $scope.userData.nameDisplay = res.rows.item(0)['name'];

          //SYNC
          //TODO make sync function
          var link = 'http://matthewwang.me/webspan/endpoint.php';

          var data = {
            email:res.rows.item(0)['email'],
            password:res.rows.item(0)['password'],
            a_function:"get_default",
            parameter:"hashed"
          }

          $http.post(link, data).then(function (response){

              document.addEventListener('deviceready', function() {
                var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

                  db.transaction(function (tx) {
                    // CLEAR EXISTING TABLE
                    //TODO CLEAR PANEL TABLE

                    //CREATE TAG TABLE
                    tx.executeSql('CREATE TABLE IF NOT EXISTS tag (uid, pattern, controluid, state, last_activation_date, name, description,category, raw_cooked, fridge_freezer, ingredient, expiry_date)');

                    tx.executeSql('DELETE FROM tag');

                    console.log("adding to tag database");
                    //console.log(JSON.stringify(response.data));

                    //add all to database
                    for (var i = 0; i < response.data['tag'].length; i++){
                      tx.executeSql('INSERT INTO tag (uid, pattern, controluid, state, last_activation_date, name, description,category, raw_cooked, fridge_freezer, ingredient, expiry_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                        [response.data['tag'][i]['uid'], response.data['tag'][i]['pattern'], response.data['tag'][i]['controluid'], response.data['tag'][i]['state'], response.data['tag'][i]['last_activation_date'], response.data['tag'][i]['name'],
                          response.data['tag'][i]['description'], response.data['tag'][i]['category'], response.data['tag'][i]['raw_cooked'], response.data['tag'][i]['fridge_freezer'], response.data['tag'][i]['ingredient'], response.data['tag'][i]['expiry_date']]);
                    }

                    tx.executeSql('SELECT * FROM tag', [], function (tx, selectRes){
                      /*for (var i = 0; i < selectRes.rows.length; i++){
                        console.log(JSON.stringify(selectRes.rows.item(i)));
                      }*/
                      //TODO make them all list items
                      //$scope.tags = Tags.all();
                    });

                  }, function (error) {
                    console.log('transaction error: ' + error.message);
                  }, function () {
                    console.log('transaction ok');
                  });

                }, function (error) {
                  console.log('Open database ERROR: ' + JSON.stringify(error));
                });
              });
          }, (function (res){
            console.log("connection failed");
          }));
        });
      }, function (error) {
        console.log('transaction error: ' + error.message);
      }, function () {
        console.log('transaction ok');
      });

    }, function (error) {
      console.log('Open database ERROR: ' + JSON.stringify(error));
    });
  });
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
