CacheStore = function(id, options) {
  
  var self = this;
  
  this.id = id || 'defaultCacheStore';
  
  _.extend(this, {
    persist: true,
    expires: null
  }, _.pick(options, 'persist', 'expires'));
  
  this.keys = _.object(_.map(amplify.store(), function(value, key) {
    if(key.match(self.id)) {
      Session.set(key, value);
      return [key, JSON.stringify(value)];
    }
  }));
}

_.extend(CacheStore.prototype, Session, {
  
  prefix: function(key) {
    return this.id + '__' + key;
  },
  
  set: function(key, value) {
    Session.set(this.prefix(key), value);
    if (this.persist) {
      amplify.store(this.prefix(key), value, {expires: this.expires});
    }
  },
  
  get: function(key) {
    return Session.get(this.prefix(key));
  },
  
  clear: function() {
    var self = this;
    _.each(this.keys, function(value, key) {
      self.set(key, null);
    });
  }
  
});