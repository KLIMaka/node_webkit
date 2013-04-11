requirejs( [ 'module1', 'stl', 'sentinellist', 'math2d' ], function(foo, stl, List, math2d) {

  function println(val) {
    window.document.write(val + '<br>');
  }
  var vec = math2d.vector;
  var seg = math2d.segment;
  var line = math2d.line;

  var segs = [new seg(new vec(-5, 2), new vec(4,8)), new seg(new vec(-2, 4), new vec(2,11))];
  var refline = new line(new vec(1,0), 0);

  var back = [];
  var front = [];
  stl.apply(segs.begin(), segs.end(), function(seg){
    refline.splitSegment(seg, front, back, front, back);
  });
  
  println(front);
  println(back);
});