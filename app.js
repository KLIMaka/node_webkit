requirejs( [ 'module1', 'stl', 'sentinellist', 'math2d', 'model'], function(foo, stl, List, math2d, Model) {

  function println(val) {
    window.document.write(val + '<br>');
  }
  
  var Vtx = Model.Vertex;
  var Seg = Model.Segment;
  var Sec = Model.Sector;

  var v1 = new Vtx(0,0);
  var v2 = new Vtx(10,0);
  var v3 = new Vtx(10,10);
  var v4 = new Vtx(0,10);

  var s1 = new Seg(v1, v2);
  var s2 = new Seg(v2, v3);
  var s3 = new Seg(v3, v4);
  var s4 = new Seg(v4, v1);

  var sec1 = new Sec([s1, s2, s3, s4], true, 's1');
  var sec2 = sec1.split(v2, v4, 's2');

  println(sec1);
  println(sec2);

});
