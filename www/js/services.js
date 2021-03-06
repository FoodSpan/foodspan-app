angular.module('foodspan.services', [])

.factory('Database', function() {

  function parseDateString(d){
    var answer = {};
    var date = new Date(d);
    var now = new Date();
    var diff = (date.getTime()-now.getTime())/(24*60*60*1000);
    if (Math.floor(diff) >= 3){
      answer["text"] = Math.floor(diff) + " days";
      answer["colour"] = "balanced";
      answer["status"] = "Fresh";
    }
    else if (Math.floor(diff) > 1){
      answer["text"] = Math.floor(diff) + " days";
      answer["colour"] = "energized";
      answer["status"] = "Spoiling Soon";
    }
    else if (Math.floor(diff) == 1){
      answer["text"] = "1 day";
      answer["colour"] = "energized";
      answer["status"] = "Spoiling Soon";
    }
    else if (diff > (1/24)) {
      answer["text"] = (Math.floor(diff*24+1)) + " hours";
      answer["colour"] = "energized";
      answer["status"] = "Spoiling Soon";
    }
    else if (diff > 0){
      answer["text"] = "less than an hour";
      answer["colour"] = "energized";
      answer["status"] = "Spoiling Soon";
    }
    else {
      answer["text"] = "spoiled";
      answer["colour"] = "assertive";
      answer["status"] = "Spoiled";
    }
    return answer;
  }

  function getTags(panelId, callback){

    var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

      //TODO get ACTUAL PP

      if (panelId == null){
        var query = 'SELECT * FROM tag';
      } else {
        var query = 'SELECT * FROM tag WHERE controluid = \"' + panelId + '\"';
      }

      db.executeSql(query, [], function (selectRes){

        console.log('getTags - transaction ok');

        var tags = [];

        if (selectRes.rows.length < 0){
          callback([]);
          console.log('NO TAGS');
        } else {

          for (var i = 0; i < selectRes.rows.length; i++){

            var parsed = parseDateString(selectRes.rows.item(i).expiry_date * 1000);

            if (selectRes.rows.item(i).fridge_freezer == 0){
              var storage = "Refrigerated";
            } else {
              var storage = "Frozen";
            }

            if (selectRes.rows.item(i).name == ''){
              var toBeName = "Tag #" + selectRes.rows.item(i).pattern;
            } else {
              var toBeName = selectRes.rows.item(i).name;
            }

            if (selectRes.rows.item(i).expiry_date == 0){
              var toBeExpiry = null;
            } else {
              var toBeExpiry = (selectRes.rows.item(i).expiry_date*1000);
            }

            var tag = {
              id: i,
              pos: selectRes.rows.item(i).pos,
              actual_id: selectRes.rows.item(i).uid,
              controluid: selectRes.rows.item(i).controluid,
              pattern: selectRes.rows.item(i).pattern,
              name: toBeName,
              status: parsed['status'],
              colour: parsed['colour'],
              checkin: (selectRes.rows.item(i).last_activation_date*1000),
              expiry: toBeExpiry,
              expiry_text: parsed['text'],
              storage: storage,
              raw_cooked: selectRes.rows.item(i).raw_cooked,
              type: selectRes.rows.item(i).category,
              description: selectRes.rows.item(i).description,
              image: 'img/tag_images/' + selectRes.rows.item(i).pattern + '.png' // in reality would be img/+pattern+.png
            };

            tags.push(tag);
          }
        }
        callback(tags);
      });
    });
  }

  return {

    getUser: function (callback){

      var userData;

      var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

        db.executeSql('SELECT * FROM user', [], function(res){
          console.log('getUserData - transaction ok');
          callback(res.rows.item(0));
        },function (error) {
          console.log('transaction error: ' + error.message);
        });

      }, function (error) {
        console.log('Open database ERROR: ' + JSON.stringify(error));
      });
    }
    , getPanels: function (callback){

      var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

        db.executeSql('SELECT * FROM panel', [], function(res){
          console.log('getPanels - transaction ok');

          if (res.rows.length < 0){
            callback([]);
          } else {

            var panels = [];

            getTags(null, function (tagData) {

              var panelCount = 0;

              for (var i = 0; i < res.rows.length; i++){

                var tagCount = 0;

                for (var j = 0; j < tagData.length; j++){
                  if(tagData[j]['controluid'] == res.rows.item(i).uid){
                    tagCount++;
                  }
                }

                var spoilingCount = 0;

                for (var k = 0; k < tagData.length; k++){
                  if(tagData[k]['status'] === "Spoiling Soon"){
                    spoilingCount++;
                  }
                }

                if (res.rows.item(i).name == null){
                  var name = "Control Panel #" + panelCount;
                } else {
                  var name = res.rows.item(i).name;
                }

                var panel = {
                  id: i,
                  actual_id: res.rows.item(i).uid,
                  name: name,
                  tags: tagCount,
                  spoiling: spoilingCount,
                  description: res.rows.item(i).description,
                  image: 'img/tag.png' // in reality would be img/+pattern+.png
                };

                panels.push(panel);

              }

              callback(panels);
            });
          }
        });
      });
    }
    , getTags: function (panelId, callback){
      getTags(panelId, callback);
    }
    , logout: function (callback){
      var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {
        db.executeSql('DELETE FROM user');
        db.executeSql('DELETE from tag');
        db.executeSql('DELETE from panel');
        callback();
      });
    }
    , checkLogin: function (callback){
      document.addEventListener('deviceready', function() {
        var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

          db.executeSql('CREATE TABLE IF NOT EXISTS user (email, password, name)');
          db.executeSql('SELECT * FROM user', [], function (res){
              if (navigator.connection.type == Connection.NONE){
                callback(0);
              } else if (res.rows.length > 0){
                console.log ("to dash");
                callback(1);
              } else {
                callback(2);
              }
            }, function (error) {
            console.log('transaction error: ' + error.message);
          })
        }, function (error) {
          console.log('Open database ERROR: ' + JSON.stringify(error));
        });
      });
    }
  }
})

.factory('Sync', function($http) {

  var link = 'https://www.foodspan.ca/webspan/endpoint.php';
  //var link = 'http://192.168.0.20:8888/endpoint.php';

  return {
    now: function(callback) {
      var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

        db.executeSql('SELECT * FROM user', [], function (res){
          //$scope.userData.nameDisplay = res.rows.item(0)['name'];

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
                    //CREATE TAG TABLE
                    tx.executeSql('CREATE TABLE IF NOT EXISTS tag (uid, pos, pattern, controluid, state, last_activation_date, name, description,category, raw_cooked, fridge_freezer, ingredient, expiry_date)');

                    tx.executeSql('DELETE FROM tag');

                    //CREATE PANEL TABLE
                    tx.executeSql('CREATE TABLE IF NOT EXISTS panel (uid, accountid, version, name, description)');

                    tx.executeSql('DELETE FROM panel');

                  }, function (error) {
                    console.log('clear - transaction error: ' + error.message);
                  }, function () {
                    console.log('clear - transaction ok');
                  });

                  db.transaction(function (tx) {

                    console.log("adding to tag database");

                    for (var i = 0; i < response.data['tag'].length; i++){
                      tx.executeSql('INSERT INTO tag (uid, pos, pattern, controluid, state, last_activation_date, name, description,category, raw_cooked, fridge_freezer, ingredient, expiry_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                        [response.data['tag'][i]['uid'], i, response.data['tag'][i]['pattern'], response.data['tag'][i]['controluid'], response.data['tag'][i]['state'], response.data['tag'][i]['last_activation_date'], response.data['tag'][i]['name'],
                          response.data['tag'][i]['description'], response.data['tag'][i]['category'], response.data['tag'][i]['raw_cooked'], response.data['tag'][i]['fridge_freezer'], response.data['tag'][i]['ingredient'], response.data['tag'][i]['expiry_date']]);
                    }

                    console.log("adding to panel database");

                    for (var i = 0; i < response.data['panel'].length; i++){
                      tx.executeSql('INSERT INTO panel (uid, accountid, version, name, description) VALUES (?,?,?,?,?)',
                        [response.data['panel'][i]['uid'], response.data['panel'][i]['accountid'], response.data['panel'][i]['version'], response.data['panel'][i]['name'], response.data['panel'][i]['description']]);
                    }

                    callback();

                  }, function (error) {
                    console.log('insert - transaction error: ' + error.message);
                  }, function () {
                    console.log('insert - transaction ok');
                  });

                }, function (error) {
                  console.log('Open database ERROR: ' + JSON.stringify(error));
                });
              });
            }, (function (res){
            console.log("sync - connection failed");
          }));
        });
      }, function (error) {
        console.log('Open database ERROR: ' + JSON.stringify(error));
      });
    }
    , login: function(email, password, callback){

      var data = {
        email:email,
        password:password,
        a_function:"login",
        parameter:""
      }

      $http.post(link, data).then(function (res){
        console.log ("server response:" + res.data['password']);

        if (res.data == "bad_credentials"){
          callback(2);

        } else {
          document.addEventListener('deviceready', function() {
            var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

              db.transaction(function (tx) {
                tx.executeSql('DELETE FROM USER');
                tx.executeSql('INSERT INTO user (email, password, name) VALUES (?, ?, ?)',
                [email, res.data['password'], res.data['name']]);

                callback(1);
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
        callback(0);
      }));
    }
    , addPanel: function(alphaId, name, description, callback) {

        var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

        db.executeSql('SELECT * FROM user', [], function (res){

        var panelData = {
          alphaId:alphaId,
          name:name,
          description:description
        }
        var data = {
          email:res.rows.item(0)['email'],
          password:res.rows.item(0)['password'],
          a_function:"reg_panel",
          parameter:JSON.stringify(panelData)
        }

        $http.post(link, data).then(function (res){

          console.log(res.data);

          if (res.data == "success"){
            callback(true);
          } else {
            callback(false);
          }

        }, (function (res){
          console.log("addPanel - connection failed");
          callback(false);
        }));
      });
      }, function (error) {
        console.log('Open database ERROR: ' + JSON.stringify(error));
      });
    }
    , editTag: function(tag, toDelete, callback){
        var db = window.sqlitePlugin.openDatabase({ name: 'foodspan.db', location: 'default' }, function (db) {

          //TODO convert tag information back
          var newTag = {
            uid: tag.actual_id,
            name: tag.name,
            state: 1,
            description: tag.description,
            category: tag.type,
            raw_cooked: tag.raw_cooked,
            fridge_freezer:tag.storage,
            expiry_date:(tag.expiry)/1000
          }

          if (toDelete){
            newTag.state = 0;
          }

        db.executeSql('SELECT * FROM user', [], function (res){
        //TODO code, make button do this
        var data = {
          email:res.rows.item(0)['email'],
          password:res.rows.item(0)['password'],
          a_function:"edit_tag",
          parameter: JSON.stringify(newTag)
        }

        $http.post(link, data).then(function (res){
          if (res.data == "success"){
            callback(true);
          } else {
            callback(false);
          }

        }, (function (res){
          console.log("editTag - connection failed");
          callback(false);
        }));
      });
      }, function (error) {
        console.log('Open database ERROR: ' + JSON.stringify(error));
      });
    }
    , deleteTag: function(callback){
      //TODO code delete tag
    }
  }
})

.factory('Tags', function(Database) {

  // the first part would make a request to the server and get back the all the rows for tags sharing the user's id

  // Some fake testing data
  /*var tags = [{
    id: 0, // (i) in the for loop probably, we'll see
    pattern: 42, // direct var
    name: 'Carrots', // direct var
    status: 'Spoiling Soon', // >1 day is fresh, 1 day to 0 is Spoiling Soon, <0 days is spoiled
    colour: 'energized', // >1 day is balanced, 1 day to 0 is energized, <0 days is assertive
    checkin: '2016/08/12', // in reality would be unix timestamp then needs to be converted to readable time
    expiry: '2016/08/17', // in reality would be unix timestamp then needs to be converted to readable time
    storage: 'Refrigerated', // direct var
    type: 'Produce', // direct var
    description: 'No description provided.', // direct var
    image: 'img/tag.png' // in reality would be img/+pattern+.png
  }, {
    id: 1,
    pattern: 42,
    name: 'Onions',
    status: 'Spoiling Soon',
    colour: 'energized',
    checkin: '2016/08/12',
    expiry: '2016/08/17',
    storage: 'Refrigerated',
    type: 'Produce',
    description: 'Onions from Farmers Market.',
    image: 'img/tag.png'
  }, {
    id: 2,
    pattern: 42,
    name: 'Potatoes',
    status: 'Fresh',
    colour: 'balanced',
    checkin: '2016/08/12',
    expiry: '2016/08/17',
    storage: 'Refrigerated',
    type: 'Produce',
    description: 'Potatoes from Costco.',
    image: 'img/tag.png'
  }, {
    id: 3,
    pattern: 42,
    name: 'Chicken',
    status: 'Fresh',
    colour: 'balanced',
    checkin: '2016/08/12',
    expiry: '2016/08/17',
    storage: 'Refrigerated',
    type: 'Meat',
    description: 'Chicken from Longos.',
    image: 'img/tag.png'
  }, {
    id: 4,
    pattern: 42,
    name: 'Lettuce',
    status: 'Spoiling Soon',
    colour: 'energized',
    checkin: '2016/08/12',
    expiry: '2016/08/17',
    storage: 'Refrigerated',
    type: 'Produce',
    description: 'Lettuce from Farmers Market.',
    image: 'img/tag.png'
  }];*/

  return {
    remove: function(tag) {
      Database.getTags(null, function (tags) {
        tags.splice(tags.indexOf(tag), 1);
      });
    },
    get: function(tagId, callback) {
      Database.getTags(null, function (tags) {
        tag = tags[tagId];
        for (var i = 0; i < tags.length; i++) {
          if (tags[i].id === tag.pos) {
            callback (tags[i]);
          }
        }
        //callback(null);
      });
    }
  }
})

.factory('Panels', function(Database) {

  // Some fake testing data
  /*var panels = [{
    id: 0,
    name: 'Freezer', // direct var
    tags: 4, // would count how many items in the tags factory probably, we'll see. if not, counts db rows
    spoiling: 2, // would count tags factory. not sure how we'd do it otherwise
    description: 'Meats Freezer.', // direct var
    image: 'img/logo.png' // probably use a stock control panel image, we'll see
  }, {
    id: 1,
    name: 'Basement Cooler',
    tags: 10,
    spoiling: 3,
    description: 'Basement cooler, mostly drinks and snacks.',
    image: 'img/logo.png'
  }, {
    id: 2,
    name: 'Fridge',
    tags: 43,
    spoiling: 8,
    description: 'Ground floor foods!',
    image: 'img/logo.png'
  }];*/

  return {
    remove: function(panel) {
      Database.getPanels(function (panels) {
        panels.splice(panels.indexOf(panel), 1);
      });
    },
    get: function(panelId, callback) {
      Database.getPanels(function (panels) {
        for (var i = 0; i < panels.length; i++) {
          if (panels[i].id === parseInt(panelId)) {
            callback (panels[i]);
          }
        }
        //callback(null);
      });
    }
  };
});
