define(['stl', 'math2d'], function(stl, math2d){

  var Node = function(segs) {

    this.line = null;
    this.front = null;
    this.back = null;
    this.segs = [];
    if (segs != undefined) this.build(segs);
  };

  Node.prototype = {

    clone : function() {

      var node = new Node();
      node.line = this.line && this.line.clone();
      node.front = this.front && this.front.clone();
      node.back = this.back && this.back.clone();
      stl.transform_copy(this.segs.begin(), this.segs.end(), node.segs.begin(), function(s){ return s.clone(); });

      return node;
    },

    invert : function() {

      stl.apply(this.segs.begin(), this.segs.end(), function(seg) { seg.flip(); });
      if (this.line) this.line.flip();
      if (this.front) this.front.invert();
      if (this.back) this.back.invert();
      var tmp = this.front;
      this.front = this.back;
      this.back = tmp;
    },

    build : function(segs) {
      
      var nsegs = [];
      stl.copy_if(segs.begin(), segs.end(), nsegs.begin(), function(s) { return !s.start.equals(s.end); });

      if (nsegs.length == 0) return;
      if (!this.line) this.line = nsegs[0].line.clone();

      var front = [], back = [];
      var self = this;
      stl.apply(nsegs.begin(), nsegs.end(), function(s){ self.line.splitSegment(s, self.segs, self.segs, front, back);  });

      if (front.length != 0) {
        if (this.front == null) this.front = new Node();
        this.front.build(front);
      }

      if (back.length != 0) {
        if (this.back == null) this.back = new Node();
        this.back.build(back);
      }
    },

    allSegments : function() {

      var segs = this.segs.slice();
      if (this.front) segs = segs.concat(this.front.allSegments());
      if (this.back) segs = segs.concat(this.back.allSegments());
      return segs;
    },

    clipSegments : function(segs) {

      if (this.line == null) return this.segs.slice();
      var front = [], back = [];
      var self = this;
      stl.apply(segs.begin(), segs.end(), function(s){ self.line.splitSegment(s, front, back, front, back); });
      if (this.front) front = this.front.clipSegments(front);
      if (this.back) back = this.back.clipSegments(back);
      else back = [];
      return front.concat(back);
    },

    clipTo : function(bsp) {

      this.segs = bsp.clipSegments(this.segs);
      if (this.front) this.front.clipTo(bsp);
      if (this.back) this.back.clipTo(bsp);
    }
  };

  return Node;

});
