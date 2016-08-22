angular.module('foodspan.services', [])

.factory('Tags', function() {
  // the first part would make a request to the server and get back the all the rows for tags sharing the user's id
  function parseDateString(prefix, fail, d){
    var answer = {};
    var date = new Date(d);
    var now = new Date();
    var diff = Math.floor((date.getTime()-now.getTime())/(24*60*60*1000));
    if (diff >= 1){
      answer["text"] = prefix + " " + diff + " days";
      answer["colour"] = "balanced";
    }
    else if (diff == 1){
      answer["text"] = prefix + " 1 day";
      answer["colour"] = "balanced";
    }
    else if (diff > 0) {
      answer["text"] = prefix + " " + (diff*24+1) + " hours";
      answer["colour"] = "energized";
    }
    else{
      answer["text"] = fail;
      answer["colour"] = "assertive";
    }
    return answer;
  }
  // Some fake testing data
  var tags = [{
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
  }];

  return {
    all: function() {
      return tags;
    },
    remove: function(tag) {
      tags.splice(tags.indexOf(tag), 1);
    },
    get: function(tagId) {
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].id === parseInt(tagId)) {
          return tags[i];
        }
      }
      return null;
    }
  };
})
.factory('Panels', function() {
  // the first part would make a request to the server and get back the all the rows for panels sharing the user's id

  // Some fake testing data
  var panels = [{
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
  }];

  return {
    all: function() {
      return panels;
    },
    remove: function(panel) {
      panels.splice(panels.indexOf(panel), 1);
    },
    get: function(panelId) {
      for (var i = 0; i < panels.length; i++) {
        if (panels[i].id === parseInt(panelId)) {
          return panels[i];
        }
      }
      return null;
    }
  };
});
