define(function() {

  var exports = {};

  // Iterators

  exports.ArrayIterator = function(array, idx) {
    this.array = array;
    this.idx = idx == undefined ? 0 : idx;
  };

  exports.ArrayIterator.prototype = {

    clone : function() {
      return new exports.ArrayIterator(this.array, this.idx);
    },

    equals : function(iter) {
      return this.array === iter.array && this.idx === iter.idx;
    },

    get : function() {
      return this.array[this.idx];
    },

    set : function(val) {
      this.array[this.idx] = val;
    },

    next : function() {
      return this.array[this.idx++];
    },

    prev : function() {
      return this.array[this.idx--];
    }
  };

  exports.Inserter = function(cont, iter) {
    this.cont = cont;
    this.iter = iter == undefined ? cont.begin() : iter;
  };

  exports.Inserter.prototype = {

    clone : function() {
      return new exports.Inserter(this.cont, this.iter);
    },

    equals : function(iter) {
      return this.cont === iter.cont && this.iter === iter.iter;
    },

    set : function(val) {
      this.cont.insert(this.iter, val);
      this.iter.next();
    },

    next : function() {
    }
  };

  // Utilites

  Array.prototype.begin = function(idx) {
    return new exports.ArrayIterator(this, idx);
  };

  Array.prototype.end = function() {
    return new exports.ArrayIterator(this, this.length);
  };
  
  Array.prototype.insert = function(iter, val) {
    this.splice(iter.idx, 0, val);
  };

  // Alghoritms

  exports.advance = function(iter, steps) {
    while (steps-- != 0)
      iter.next();
    return iter;
  };

  exports.distance = function(i1, i2) {
    var dist = 0;
    while (!i1.equals(i2)) {
      i1.next();
      dist++;
    }
    return dist;
  };

  exports.swap = function(i1, i2) {
    var tmp = i1.get();
    i1.set(i2.get());
    i2.set(tmp);
  };

  exports.copy = function(ib, ie, ob) {
    while (!ib.equals(ie)) {
      ob.set(ib.next());
      ob.next();
    }
    return ob;
  };

  exports.transform = function(b, e, func) {
    while (!b.equals(e)) {
      b.set(func(b.get()));
      b.next();
    }
  };

  exports.copy_if = function(ib, ie, ob, pred) {
    while (!ib.equals(ie)) {
      var val = ib.next();
      if (pred(val)) {
        ob.set(val);
        ob.next();
      }
    }
    return ob;
  }

  exports.transform_copy = function(ib. ie, ob, func) {
    while (!ib.equals(ie)) {
      ob.set(func(ib.next()));
      ob.next();
    }
    return ob;
  }

  exports.apply = function(b, e, func) {
    while (!b.equals(e)) {
      func(b.next());
    }
  };

  exports.find = function(b, e, val) {
    while (!b.equals(e)) {
      if (b.get() == val)
        return b;
      b.next();
    }
    return b;
  };

  exports.toArray = function(b, e) {
    var ret = [];
    while (!b.equals(e)) {
      ret.push(b.next());
    }
    return ret;
  };

  return exports;

});