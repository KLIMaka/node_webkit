requirejs( [ 'module1', 'stl', 'sentinellist', 'math2d', 'model'], function(foo, stl, List, math2d, Model) {

  function println(val) {
    window.document.write(val + '<br>');
  }
  
  var Vertex = Model.Vertex;
  var Segment = Model.Segment;

  var v1 = new Vertex(0 , 0);
  var v2 = new Vertex(10, 0);
  var v3 = new Vertex(10, 10);
  var v4 = new Vertex(0 , 10);

  var s1 = new Segment(v1, v2);
  var s2 = new Segment(v2, v3);
  var s3 = new Segment(v3, v4);
  var s4 = new Segment(v4, v1);

  console.log(v1.isAdjacent(v2));
  console.log(v1.isAdjacent(v4));
  console.log(v1.isAdjacent(v3));

  v2.replace(v1);

  console.log(v1.isAdjacent(v2));
  console.log(v1.isAdjacent(v4));
  console.log(v1.isAdjacent(v3));
});