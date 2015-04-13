CacheStore = function(id, options) {
  var self = this;
  
  this.id = '__wizard_' + (id || 'default');
  this.keys = {};
  
  _.extend(this, {
    persist: true
  }, _.pick(options, 'persist'));
  
  if (this.persist) {
    var cache = Meteor._localStorage.getItem(this.id);
    if (cache) {
      _.each(EJSON.parse(cache), function(value, key) {
        Session.set(self.prefix(key), value);
        self.keys[key] = value;
      });
    }
  }
};

_.extend(CacheStore.prototype, Session, {
  prefix: function(key) {
    return this.id + '__' + key;
  },
  
  set: function(key, value) {
    Session.set(this.prefix(key), value);
    if (this.persist) {
      this.keys[key] = value;
      Meteor._localStorage.setItem(this.id, EJSON.stringify(this.keys));
    }
  },
  
  get: function(key) {
    return Session.get(this.prefix(key));
  },
  
  clear: function() {
    var self = this;
    _.each(this.keys, function(value, key) {
      Session.set(self.prefix(key), null);
    });
    if (this.persist)
      Meteor._localStorage.removeItem(this.id);
  }
});