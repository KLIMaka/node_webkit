requirejs(['module1', 'stl', 'sentinellist'], function(foo, stl, List){

	function println(val) {
		window.document.write(val + '<br>');
	}

	var a = [1,2,3,4,5];
	var b = new List(9,9,9,9,9);
	var c = [9,9,9,9,9];

	stl.copy     (a.begin(), a.end(), new stl.Inserter(b));
	stl.transform(b.begin(), b.end(), function(val) { return val + 11 });

	println(b.toString());
})