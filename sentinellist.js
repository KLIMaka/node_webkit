define(function() {

  // /////////////////
  // List Node
  // /////////////////

  function ListNode(obj) {
    this.obj = obj;
    this.next = null;
    this.prev = null;
  }

  ListNode.prototype = {

    clear : function() {
      this.obj = null;
      this.next = null;
      this.prev = null;
    }
  };

  // /////////////////
  // Iterator
  // /////////////////

  function ListIterator(list, ref) {
    this.list = list;
    this.ref = ref == undefined ? list.first() : ref;
  }

  ListIterator.prototype = {

    clone : function() {
      return new ListIterator(this.list, this.ref);
    },

    next : function() {
      var obj = this.ref.obj;
      this.ref = this.ref.next;
      return obj;
    },

    prev : function() {
      var obj = this.ref.obj;
      this.ref = this.ref.prev;
      return obj;
    },

    equals : function(iter) {
      return this.list === iter.list && this.ref === iter.ref;
    },

    get : function() {
      return this.ref.obj;
    },

    set : function(val) {
      this.ref.obj = val;
    }
  };

  // /////////////////
  // Sentinel List
  // /////////////////

  function SentinelList() {
    this.nil = new ListNode(null);
    this.nil.prev = this.nil;
    this.nil.next = this.nil;

    for ( var i = 0; i < arguments.length; i++) {
      this.push(arguments[i]);
    }
  }

  SentinelList.prototype = {

    insertBefore : function(obj, ref) {
      ref = ref == undefined ? this.first() : ref;
      var ent = new ListNode(obj);

      ent.next = ref;
      ent.prev = ref.prev;
      ent.prev.next = ent;
      ref.prev = ent;

      return new ListIterator(this, ent);
    },

    insertAfter : function(obj, ref) {
      ref = ref == undefined ? this.last() : ref;
      var ent = new ListNode(obj);

      ent.next = ref.next;
      ent.next.prev = ent;
      ref.next = ent;
      ent.prev = ref;

      return new ListIterator(this, ent);
    },

    insert : function(iter, val) {
      return this.insertBefore(val, iter.ref);
    },

    _remove : function(ref) {
      if (ref === this.nil)
        return this;

      ref.next.prev = ref.prev;
      ref.prev.next = ref.next;
      ref.clear();

      return this;
    },

    remove : function(iter) {
      this._remove(iter.ref);
      return this;
    },

    push : function(obj) {
      this.insertAfter(obj);
      return this;
    },

    pushFront : function(obj) {
      this.insertBefore(obj);
      return this;
    },

    pop : function() {
      this.remove(this.last());
      return this;
    },

    popFront : function() {
      this.remove(this.first());
      return this;
    },

    first : function() {
      return this.nil.next;
    },

    last : function() {
      return this.nil.prev;
    },

    begin : function() {
      return new ListIterator(this);
    },

    end : function() {
      return new ListIterator(this, this.nil);
    },

    clear : function() {
      var cur = this.nil.prev;
      while (cur !== this.nil) {
        var tmp = cur.prev;
        cur.clear();
        cur = tmp;
      }
    },

    toArray : function() {
      var list = [];
      var curr = this.first();
      while (curr !== this.nil) {
        list.push(curr.obj);
        curr = curr.next;
      }
      return list;
    },

    toString : function() {
      return '[' + this.toArray().join(', ') + ']';
    },
    
  };

  return SentinelList;
});