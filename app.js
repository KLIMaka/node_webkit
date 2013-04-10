requirejs( [ 'module1', 'stl', 'sentinellist', 'math2d' ], function(foo, stl, List, math2d) {

  function println(val) {
    window.document.write(val + '<br>');
  }
  var vec = math2d.vector;
  var seg = math2d.segment;

  var s = new seg(new vec(0,0), new vec(10,0));
  println(s);
  s.flip();
  println(s);
  
  println(s.contain(new vec(5,0)));
});