define(['math2d', 'sentinellist', 'stl'], function(Math2d, List, STL){

  var Vertex2D = Math2d.vertex;
  var Vertex = function(x, y) {
    Vertex2D.call(this, x, y);
    this.adj = new List();
  };

  Vertex.prototype = new Vertex2D(0,0);

  Vertex.prototype.clone = function() {
    var vtx = new Vertex(this.x, this.y);
    STL.copy(this.adj.begin(), this.adj.end(), new STL.Inserter(vtx.adj));
    return vtx;
  }

  Vertex.prototype.connectToSegment = function(seg) {
    var iter = STL.find(this.adj.begin(), this.adj.end(), seg);
    if (iter.equals(this.adj.end()))
      this.adj.push(seg);
  };

  Vertex.prototype.disconnectFromSegment = function(seg) {
    var iter = STL.find(this.adj.begin(), this.adj.end(), seg);
    if (!iter.equals(this.adj.end()))
      this.adj.remove(iter);
  };

  Vertex.prototype.isAdjacent = function(vtx) {
    var iter = STL.find_if(this.adj.begin(), this.adj.end(), function(seg) { return seg.start.equals(vtx) || seg.end.equals(vtx); });
    return iter.equals(this.adj.end()) ? null : iter.get();
  };

  Vertex.prototype.replace = function(vtx) {
    var self = this;
    STL.apply(this.adj.begin(), this.adj.end(), function(seg) {
      if (seg.start === self) {
        seg.setStart(vtx);
      } else {
        seg.setEnd(vtx);
      }
    });
    this.adj.clear();
  };


  var Segment2D = Math2d.segment;
  var Segment = function(start, end, front, back) {
    Segment2D.call(this, start, end);
    this.front = front;
    this.back = back;

    this.start.connectToSegment(this);
    this.end.connectToSegment(this);
  };

  Segment.prototype = new Segment2D(new Vertex2D(0,0), new Vertex2D(0,0));

  Segment.prototype.remove = function() {
    this.start.disconnectFromSegment(this);
    this.end.disconnectFromSegment(this);
  };

  Segment.prototype.setStart = function(start) {
    if (this.start !== null) 
      this.start.disconnectFromSegment(this);
    this.start = start;
    this.start.connectToSegment(this);
  };

  Segment.prototype.setEnd = function(end) {
    if (this.end !== null) 
      this.end.disconnectFromSegment(this);
    this.end = end;
    this.end.connectToSegment(this);
  };

  Segment.prototype.hasVertex = function(vtx) {
    return this.start.equals(vtx) || this.end.equals(vtx);
  };

  Segment.prototype.toString = function() {
    return Segment2D.prototype.toString.call(this) + '(' + (this.front && this.front.tag) + '|' + (this.back && this.back.tag) + ')';
  };

  var ord_seg_adapter = function(seg, order) {
    this.seg = seg;
    this.order = order;
  };

  ord_seg_adapter.prototype = {

    get : function() {
      return this.seg;
    },

    getStart : function() {
      return this.order ? this.seg.start : this.seg.end;
    },

    getEnd : function() {
      return this.order ? this.seg.end : this.seg.start;
    },

    setFront : function(front) {
      if (this.order)
        this.seg.front = front;
      else
        this.seg.back = front;
    },

    setBack : function(back) {
      if (this.order)
        this.seg.back = back;
      else
        this.seg.front = back;
    }
  };

  var odr_seg_iter = function(iter, order) {
    this.iter = iter;
    this.order = order;
  };

  odr_seg_iter.prototype = {

    equals : function(iter) {
      return this.iter.equals(iter);
    },

    clone : function() {
      return new odr_seg_iter(this.iter, this.order);
    },

    get : function() {
      return new ord_seg_adapter(this.iter.get(), this.order);
    },

    getIter : function() {
      return this.iter;
    },

    next : function() {
      var prevSeg = this.iter.next();
      var ret = new ord_seg_adapter(prevSeg, this.order);

      var seg = this.iter.get();
      if (seg)
        this.order = (prevSeg.end === seg.start) || (prevSeg.start === seg.start);  
      return ret;
    },
  };

  var Sector = function(segs, order, tag) {
    this.segs = new List();
    this.order = order;
    this.tag = tag;

    var self = this;
    var prevSeg = null;
    STL.transform_copy(new odr_seg_iter(segs.begin(), order), segs.end(), new STL.Inserter(this.segs), function(seg_adapter) {
      seg_adapter.setFront(self);
      return seg_adapter.get();
    });
  };

  Sector.prototype.getFirstSegment = function(vtx) {
    return STL.find_if(this.segs.begin(), this.segs.end(), function(seg) { return seg.hasVertex(vtx)  });
  };

  Sector.prototype.getEdge = function(vtx) {

    var seg_iter = this.getFirstSegment(vtx);
    if (seg_iter.equals(this.segs.end())) return null;

    var seg = seg_iter.get();
    var tmp_iter = seg_iter.clone();
    tmp_iter.next();
    var next = tmp_iter.get();

    if (seg_iter.equals(this.segs.begin())) {
      if (!next.hasVertex(vtx)) {
        var last = this.segs.last().obj;
        return [(last.start === vtx ? last.end : last.start), vtx, (seg.start === vtx ? seg.end : seg.start)];
      }
    }

    return [(seg.start === vtx ? seg.end : seg.start), vtx, (next.start === vtx ? next.end : next.start)];
  };

  Sector.prototype.split = function(seg, tag) {

    var vtx1 = seg.start;
    var vtx2 = seg.end;
    var start_iter = STL.find_if(new odr_seg_iter(this.segs.begin(), this.order), this.segs.end(), function(seg_adapter) {
      return seg_adapter.getStart() === vtx1 || seg_adapter.getStart() === vtx2;
    }).getIter();

    var start_vtx = start_iter.get().hasVertex(vtx1) ? vtx1 : vtx2;
    var end_vtx = start_vtx === vtx1 ? vtx2 : vtx1;

    if (start_vtx === vtx1) seg.front = this;
    else                    seg.back  = this;

    var end_iter = STL.find_if(start_iter, this.segs.end(), function(seg) { return seg.hasVertex(end_vtx); });
    end_iter.next();

    var segs_1 = new List();
    if (!this.segs.begin().equals(start_iter))
      STL.copy(this.segs.begin(), start_iter, new STL.Inserter(segs_1));
    segs_1.push(seg);
    STL.copy(end_iter, this.segs.end(), new STL.Inserter(segs_1, segs_1.end()));
    
    this.segs = segs_1;
    this.order = segs_1.first().obj.front === this;

    var segs_2 = new List();
    STL.copy(start_iter, end_iter, new STL.Inserter(segs_2));
    segs_2.push(seg);

    return new Sector(segs_2, start_vtx === segs_2.first().obj.start, tag);
  };

  Sector.prototype.toString = function() {
    return this.tag + ':' + this.segs.toString();
  }

  var Level = function() {
    this.vtxs = new List();
    this.segs = new List();
    this.secs = new List();
  };

  Level.prototype = {

    findVertex : function(vtx) {
      return STL.find_if(this.vtxs.begin(), this.vtxs.end(), function(vtx1) { return vtx.equals(vtx1); });
    },

    onSegment : function(vtx) {
      return STL.find_if(this.segs.begin(), this.segs.end(), function(seg) { return seg.contain(vtx); });
    },

    getContainigSector : function(seg) {
      return STL.find_if(this.secs.begin(), this.secs.end(), function(sec) {
        var e1 = sec.getEdge(seg.start);
        var e2 = sec.getEdge(seg.end);
        if (e1 != null && e2 != null) 
          return e1[1].angle(e1[0], e1[2]) > e1[1].angle(e1[0], seg.end) && e2[1].angle(e2[0], e2[2]) > e2[1].angle(e2[0], seg.start);
        return false;
      });
    },

    addSegment : function(seg) {
      this.segs.push(seg);
    },

    addVertex : function(x, y) {

      var vtx = new Vertex(x ,y);
      var vtx_iter = this.findVertex(vtx);
      if (!vtx_iter.equals(this.vtxs.end()))
        return vtx_iter.get();

      this.vtxs.push(vtx);

      var seg_iter = this.onSegment(vtx);
      if (!seg_iter.equals(this.segs.end())) {
        var seg = seg_iter.get();
        var a = new Segment(seg.start, vtx, seg.front, seg.back);
        var b = new Segment(vtx, seg.end, seg.front, seg.back);
        
        if (seg.front) {
          var front_segs = seg.front.segs;
          var front_seg_iter = STL.find(front_segs.begin(), front_segs.end(), seg);
          var ab = [a, b];
          STL.copy(ab.begin(), ab.end(), new STL.Inserter(front_segs, front_seg_iter));
          front_segs.remove(front_seg_iter);
        }
        if (seg.back) {
          var back_segs = seg.back.segs;
          var back_seg_iter = STL.find(back_segs.begin(), back_segs.end(), seg);
          var ba = [b, a];
          STL.copy(ba.begin(), ba.end(), new STL.Inserter(back_segs, back_seg_iter));
          back_segs.remove(back_seg_iter);
        }

        this.segs.remove(seg_iter);
        this.addSegment(a);
        this.addSegment(b);
      }

      return vtx;
    },

    addSector : function(vtxs, tag) {

      var pts = [];
      var self = this;
      STL.transform_copy(vtxs.begin(), vtxs.end(), pts.begin(), function(vtx) { 
        return self.addVertex(vtx[0], vtx[1]); 
      });

      var order = true;
      var segs = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        var b = pts[i+1 == pts.length ? 0 : i+1];
        var seg = a.isAdjacent(b);
        if (seg == null) {
          seg = new Segment(a, b, null, null);
          this.addSegment(seg);
        } else if (i == 0 && seg.start !== a) {
          order = false;
        }
        segs.push(seg);
      }

      var sec = new Sector(segs, order, tag);
      this.secs.push(sec);
      return sec;
    },

    splitSector : function(vtx1, vtx2, tag) {

      var seg = new Segment(vtx1, vtx2);
      var sec_iter = this.getContainigSector(seg);
      if (sec_iter.equals(this.secs.end())) {
        seg.remove();
        return null;
      }

      var new_sector = sec_iter.get().split(seg, tag);
      this.addSegment(seg);
      this.secs.push(new_sector);
      return new_sector;
    },

    joinSectors : function(sec1, sec2) {

      var common_start_iter = STL.find_if(sec1.segs.begin(), sec1.segs.end(), function(seg) {
        return seg.front === sec2 || seg.back === sec2;
      });
      var common_end_iter = STL.find_if(common_start_iter, sec1.segs.end(), function(seg) {
        return seg.front !== sec2 || seg.back !== sec2;
      });
    },

  };

  return {
    Vertex  : Vertex,
    Segment : Segment,
    Sector  : Sector,
    Level   : Level
  };

});