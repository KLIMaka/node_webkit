requirejs( [ 'module1', 'stl', 'sentinellist', 'math2d', 'model'], function(foo, stl, List, math2d, Model) {

  function println(val) {
    window.document.write(val + '<br>');
  }
  
  var a = [1,2,3,4,5,6,7];
  stl.rotate(a.begin(), a.begin(3), a.end());
  println(a);
});