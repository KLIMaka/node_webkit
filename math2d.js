define(function() {

  var EPSILON = 1e-5;

  var vector = function(x, y) {
    this.x = x;
    this.y = y == undefined ? x : y;
  };

  vector.prototype = {

    clone : function() {
      return new vector(this.x, this.y);
    },

    equals : function(vec) {
      return this.x === vec.x && this.y === vec.y;
    },

    toString : function() {
      return '[' + this.x + ', ' + this.y + ']';
    },

    add : function(vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    },

    sub : function(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
    },

    scale : function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    },

    dot : function(vec) {
      return this.x * vec.x + this.y * vec.y;
    },

    sqlength : function() {
      return this.dot(this);
    },

    length : function() {
      return Math.sqrt(this.sqlength());
    },

    normalize : function() {
      var len = this.length();
      return this.scale(1.0 / len);
    },

    negate : function() {
      this.x = -this.x;
      this.y = -this.y;
      return this;
    },

    ortho : function() {
      var tmp = this.x;
      this.x = -this.y;
      this.y = tmp;
      return this;
    },

    ang : function() {
      var unit = this.clone().normalize();
      var ang = (180 / Math.PI) * Math.acos(unit.x);
      ang = unit.y < 0 ? 360 - ang : ang;
      return -ang;
    }
  };

  var vertex = function(x, y) {
    vector.call(this, x, y);
  };

  vertex.prototype = new vector(0, 0);
  vertex.prototype.angle = function(a, b) {
    var toA = new vector(a.x - this.x, a.y - this.y);
    var toB = new vector(b.x - this.x, b.y - this.y);
    var ang = toB.ang() - toA.ang();
    return ang < 0 ? 360 + ang : ang;
  };

  var line = function(normal, w) {
    this.normal = normal.clone();
    this.w = w;
  };

  line.prototype = {

    clone : function() {
      return new line(this.normal, this.w);
    },

    flip : function() {
      this.normal.negate();
      this.w = -this.w;
    },

    intersect : function(line) {

      var r = this.normal.x * line.normal.y - line.normal.x * this.normal.y;
      if (r == 0.0)
        return null;

      var x = (this.normal.y * line.w - line.normal.y * this.w) / r;
      var y = (this.w * line.normal.x - line.w * this.normal.x) / r;
      return new vertex(x, y);
    },

    side : function(point) {
      return this.normal.dot(point) + this.w;
    },

    splitSegment : function(segment, colinearFront, colinearBack, front, back) {

      var intersect = this.intersect(segment.line);
      if (intersect != null) {
        var start = segment.start;
        var end = segment.end;
        var s_to_e = end.clonee().sub(start);
        var sqlen = s_to_e.sqlength();
        var t = intersect.clone().sub(start).dot(s_to_e) / sqlen;
        if (t <= EPSILON || t >= (1.0 - EPSILON)) {
          (this.side(Math.abs(t) <= EPSILON ? end : start) >= 0.0 ? front : back).push(segment);
        } else {
          var a = new segment(start, intersect);
          var b = new segment(intersect, end);
          (this.side(start) >= 0.0 ? front : back).push(a);
          (this.side(end) >= 0.0 ? front : back).push(b);
        }
      } else if (this.side(segment.start) == 0.0) {
        (this.normal.dot(segment.line.normal) >= 0.0 ? colinearFront : colinearBack).push(segment);
      } else {
        (this.side(segment.start) ? front : back).push(segment);
      }
    }
  };

  var segment = function(start, end) {
    this.start = start.clone();
    this.end = end.clone();

    var normal = this.end.clone().sub(this.start).normalize().ortho();
    var w = normal.dot(this.start);
    this.line = new line(normal, -w);
  };

  segment.prototype = {

    clone : function() {
      return new segment(this.start, this.end);
    },

    flip : function() {
      var tmp = this.start;
      this.start = this.end;
      this.end = tmp;
      this.line.flip();
    },

    toString : function() {
      return "(" + this.start.toString() + "-" + this.end.toString() + ")";
    },

    isIntersects : function(segment) {

      if (this.start.equals(segment.start) || this.start.equals(segment.end) || this.end.equals(segment.start) || this.end.equals(segment.end)) {
        return false;
      }

      if (this.contain(segment.start) || this.contain(segment.end) || segment.contain(this.start) || segment.contain(this.end)) {
        return true;
      }

      var inter = this.line.intersect(segment.line);
      return inter != null && this.contain(inter) && segment.contain(inter);
    },

    contain : function(vertex) {

      if (Math.abs(this.line.side(vertex)) > EPSILON)
        return false;

      var start = this.start;
      var end = this.end;
      var s_to_e = end.clone().sub(start);
      var sqlen = s_to_e.sqlength();
      var t = vertex.clone().sub(start).dot(s_to_e) / sqlen;

      return !(t <= EPSILON || t >= (1.0 - EPSILON));
    },

    length : function() {
      return this.end.clone().sub(this.start).length();
    }
  };

  var exports = {

    vector : vector,
    vertex : vertex,
    line : line,
    segment : segment,

    vecadd : function(v1, v2) {
      return v1.clone().add(v2);
    },

    vecsub : function(v1, v2) {
      return v1.clone().sub(v2);
    },

    lerp : function(v1, v2, t) {
      return v1.clone().add(v2.clone().substract(v2).scale(t));
    },

    dot : function(v1, v2) {
      return v1.dot(v2);
    }
  };

  return exports;
});