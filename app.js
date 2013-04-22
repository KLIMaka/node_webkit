requirejs( [ 'module1', 'stl', 'sentinellist', 'math2d', 'model'], function(foo, stl, List, math2d, Model) {

  function println(val) {
    window.document.write(val + '<br>');
  }
  
  var Vtx = Model.Vertex;
  var Seg = Model.Segment;
  var Sec = Model.Sector;
  var Lvl = Model.Level;

  var lvl = new Lvl();

  lvl.addSector([[0,0], [20,0], [20,20], [0,20]], 's1');
  var v1 = lvl.addVertex(10, 0);
  var v2 = lvl.addVertex(10, 20);
  lvl.splitSector(v1, v2, 's2');
  var v3 = lvl.addVertex(10, 10);
  var v4 = lvl.addVertex(0, 10);
  lvl.splitSector(v3, v4, 's3');

  stl.apply(lvl.secs.begin(), lvl.secs.end(), function(sec) { println(sec); });
  
});
