angular.module('starter.services', [])

.factory('Tags', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var tags = [{
    id: 0,
    pattern: 42,
    name: 'Carrots',
    status: 'Spoiling Soon',
    colour: 'energized',
    checkin: '2016/08/12',
    expiry: '2016/08/17',
    storage: 'Refrigerated',
    type: 'Produce',
    description: 'No description provided.',
    image: 'img/tag.png'
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
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var panels = [{
    id: 0,
    name: 'Freezer',
    tags: 4,
    spoiling: 2,
    description: 'Meats Freezer.',
    image: 'img/logo.png'
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
