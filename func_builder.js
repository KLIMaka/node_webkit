define(function(){
	
	var unary = function(op, arg) {
    return {
      build : function(args) {
        return op + ' ' + arg.build(args) ;
      },
    }
  };

  var binary = function(op, arg1, arg2) {
    return {
      build : function(args) {
        return '(' + arg1.build(args) + op + arg2.build(args) + ')';
      }
    }
  };

  var index = function(obj, idx) {
    return {
      build : function(args) {
        return '(' + obj.build(args) + '[' + idx.build(args) + '])';
      }
    };
  };

  var seq = function(stats) {
    return {
      build : function(args) {
        var ret = [];
        for (var i = 0; i < stats.length; i++) {
          ret.push(stats[i].build(args));
        }
        return ret.join(';');
      }
    };
  };

  var while_ = function(cond, stats) {
    return {
      build : function(args) {
        return 'while (' + cond.build(args) + '){' + stats.build(args) + '};'
      }
    };
  };

  var const_ = function(c) {
    return {
      build : function(args) { return c; }
    }
  };

  var print = function(val) {
    return {
      build : function(args) { return 'println(' + val.build(args) + ')'; }
    }
  }

  var _1 = { build : function(args) { return args._1; }};
  var _2 = { build : function(args) { return args._2; }};
  var _3 = { build : function(args) { return args._3; }};

  var array_iter_eq = 
    binary('&&', 
      binary('===', 
        binary('.', _1, const_('idx')),
        binary('.', _2, const_('idx'))
      ),
      binary('===', 
        binary('.', _1, const_('array')),
        binary('.', _2, const_('array'))
      )
  );

  var array_iter_get = index(binary('.', _1, const_('array')), binary('.', _1, const_('idx')));
  var array_iter_next = index(binary('.', _1, const_('array')), binary('++', binary('.', _1, const_('idx')), const_('')));
  var array_iter_clone = binary('new ArrayIterator', const_(''), binary(',', binary('.', _1, const_('array')), binary('.', _1, const_('idx'))));


  var ex = seq([
    binary('=', _1, array_iter_clone),
    while_(unary('!', array_iter_eq), 
      seq([
        print(array_iter_next)
      ])
    )
  ]);

  var find_quick = 
    jsOptimize(
      STL.find_if, 
      function(arg) {return arg.arr.begin()},
      function(arg) {return arg.arr.end()},
      function(el) { return el.at == 12;})
    );
  var res = find_quick(this);
  
  var exF = new Function('b', 'e', 'ArrayIterator', 'println', ex.build({_1:'b', _2:'e'}));
  var t = [1,2,3,4,5,6,7,8];
  exF(t.begin(), t.end(), stl.ArrayIterator, println);
  println(exF);
  println((new Function('t', 'return t'))(t));

});