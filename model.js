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

  var Sector = function(segs, order) {
    this.segs = new List();
    this.order = order;

    var self = this;
    var prevSeg = null;
    STL.transform_copy(segs.begin(), segs.end(), new STL.Inserter(this.segs), function(seg) {
      if (prevSeg != null) {
        order = (prevSeg.end === seg.start) || (prevSeg.start === seg.start);
      }
      if (order) seg.front = self;
      else seg.back = self;
      prevSeg = seg;
      return seg;
    });
  };

  Sector.prototype.getFirstSegment = function(vtx) {
    return STL.find_if(this.segs.begin(), this.segs.end(), function(seg) { return seg.hasVertex(vtx)  });
  };

  Sector.prototype.getEdge = function(vtx) {

    var seg_iter = this.getFirstSegment(vtx);
    if (seg_iter.equals(this.segs.end())) return null;

    var seg = seg_iter.get();
    var next = seg_iter.next();

    if (seg_iter.equals(this.segs.begin())) {
      if (!next.hasVertex(vtx)) {
        var last = this.segs.last().obj;
        return [(last.start === vtx ? last.end : last.start), vtx, (seg.start === vtx ? seg.end : seg.start)];
      }
    }

    return [(seg.start === vtx ? seg.end : seg.start), vtx, (next.start === vtx ? next.end : next.start)];
  };

  Sector.prototype.split = function(vtx1, vtx2, seg) {

    var order = this.order;
    var prevSeg = null;
    var start_iter = STL.find_if(this.segs.begin(), this.segs.end(), function(seg) {
      if ((order && (seg.start === vtx1 || seg.start == vtx2)) || (!order && (seg.end === vtx1 || seg.end === vtx2)))
        return true;

      prevSeg = seg;
      order = (prevSeg.end === seg.start) || (prevSeg.start === seg.start);
      return false;
    });

    var start_vtx = start_iter.get().hasVertex(vtx1) ? vtx1 : vtx2;
    var end_vtx = start_vtx === vtx1 ? vtx2 : vtx1;

    var end_iter = STL.find_if(start_iter.clone(), this.segs.end(), function(seg) { return seg.hasVertex(end_vtx); });
    end_iter.next();

    var segs_1 = new List();
    if (!this.segs.begin().equals(start_iter))
      STL.copy(this.segs.begin(), start_iter, new STL.Inserter(segs_1));
    STL.copy(end_iter.clone(), this.segs.end(), new STL.Inserter(segs_1, segs_1.end()));
    segs_1.push(seg);
    this.segs = segs_1;
    this.order = segs_1.first().obj.front === this;

    if (start_vtx === vtx1) seg.front = this;
    else                    seg.back  = this;

    var segs_2 = new List();
    STL.copy(start_iter.clone(), end_iter, new STL.Inserter(segs_2));
    segs_2.push(seg);

    return new Sector(segs_2, start_vtx === segs_2.first().obj.start);
  };

  Sector.prototype.toString = function() {
    return this.segs.toString();
  }

  return {
    Vertex : Vertex,
    Segment : Segment,
    Sector : Sector,
  };

});