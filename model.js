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
  }


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

  return {
    Vertex : Vertex,
    Segment : Segment
  };

});