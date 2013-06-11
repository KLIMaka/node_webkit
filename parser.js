define(['stl'], function(STL) {

  function LexerRule(patt, name) {
    this.pattern = patt;
    this.name = name;
  }
   
  LexerRule.prototype = {
  }

  function Lexer() {
 
    this.rulesByName = {};
    this.rulesByPatt = {};
    this.rules = [];
    this.src = '';
    this.offset = 0;
    this.lastOffset = 0;
    this.eoi = false;

    this.matchedRule = null;
    this.matchedValue = null;
    
    this.rbegin = new STL.ArrayIterator(this.rules, 0);
    this.rend = new STL.ArrayIterator(this.rules, 0);
  }

  Lexer.prototype = {
    
    addRule : function(rule) {
      var r = this.rulesByName[rule.name];
      if (r == undefined) {
        rule.id = this.rules.length;
        this.rules.push(rule);
      } else {
        var idx = this.rules.indexOf(r);
        rule.id = idx;
        this.rules[idx] = rule;
      }
      
      this.rulesByName[rule.name] = rule;
      this.rulesByPatt[rule.patt] = rule;
      this.rend = new STL.ArrayIterator(this.rules, this.rules.length);
    },

    mark : function() {
      return this.lastOffset;
    },

    reset : function(offset) {
      this.offset = offset || 0;
      this.eoi = false;
      return this.next();
    },
    
    setSource : function(src) {
      this.src = src;
      this.offset = 0;
      this.eoi = false;
    },
    
    exec : function(rbegin, rend) {
      if(this.eoi)
        return;

      var len = 0;
      var matchedValue = null;
      var matchedRule = null;
      var subsrc = this.src.substr(this.offset);
      while (!rbegin.equals(rend)) {
        var rule = rbegin.next();
        var match = rule.pattern.exec(subsrc);
        if (match != null && match[0].length >= len) {
          matchedValue = match;
          matchedRule = rule;
          len = match[0].length;
        }
      }

      this.matchedRule = matchedRule;
      this.matchedValue = matchedValue;
      this.lastOffset = this.offset;
      this.offset += len;

      if(this.offset >= this.src.length)
        this.eoi = true;

      if (matchedRule == null)
        throw new Error('Unexpected input "'+ subsrc.substr(0, 10) + '..."');

      return matchedRule != null ? matchedRule.name : null;
    },
    
    next : function() {
      return this.exec(new STL.ArrayIterator(this.rules, 0), this.rend);
    },

    value : function(idx) {
      return this.matchedValue[idx || 0];
    },

    rule : function() {
      return this.matchedRule;
    }
  }

  function Capture(val, name) {
    this.val = val;
    this.name = name;
  }

  Capture.prototype = {
    isValid : function() {
      return this.val != null;
    },

    get : function(ctx) {
      var ctx = ctx || {};
      if (this.name) {
        ctx[this.name] = this.val;
        return ctx;
      } else {
        return this.val;
      }
    },
  }

  var InvalidCapture = new Capture(null);
  function capture(val, name) { return new Capture(val, name);}

  function SimpleParserRule(id) {
    this.id = id;
  }

  SimpleParserRule.prototype = {
    match : function(parser) {
      if (parser.lex.rule().name != this.id)
        return InvalidCapture;
      return capture(parser.lex.value());
    }
  }

  function BindingParserRule(name, rule) {
    this.name = name;
    this.rule = rule;
  }

  BindingParserRule.prototype = {
    match : function(parser) {
      var res = this.rule.match(parser);
      if (!res.isValid())
        return res;
      return capture(res.get(), this.name);
    }
  }

  function OrRule(rules) {
    this.rules = rules;
  }

  OrRule.prototype = {
    match : function(parser) {
      for (var i = 0; i < this.rules.length; i++) {
        var rule = this.rules[i];
        var res = rule.match(parser);
        if (!res.isValid())
          continue;
        return capture(res.get());
      }
      return InvalidCapture;
    }
  }

  function AndRule(rules) {
    this.rules = rules;
  }

  AndRule.prototype = {
    match : function(parser) {
      var capt = {};
      var mark = parser.lex.mark();
      for (var i = 0; i < this.rules.length; i++) {
        var rule = this.rules[i];
        var res = rule.match(parser);
        if (!res.isValid()) {
          parser.lex.reset(mark);
          return res;
        }
        res.get(capt);
        if (i != this.rules.length-1)
          parser.next();
      }
      return capture(capt);
    }
  }

  function CountRule(rule, from, to) {
    this.rule = rule;
    this.from = from || 0;
    this.to = to || 0;
  }

  CountRule.prototype = {
    match : function(parser) {
      var arr = [];
      var i = 0;
      var begin = parser.lex.mark();
      var mark = begin;
      while (true) {
        if (this.to > 0 && this.to == i) {
          parser.lex.reset(mark);
          break;
        }
        var latMark = parser.lex.mark();
        var res = this.rule.match(parser);
        if (!res.isValid()) {
          if (i < this.from) {
            parser.lex.reset(begin);
            return res;
          } else {
            parser.lex.reset(latMark);
            return capture(arr);
          }
        }
        arr.push(res.get());
        mark = latMark;
        parser.next();
        i++;
      }
      return capture(arr);
    }
  }

  function Parser(lexer, skip) {
    this.lex = lexer;
    this.skip = skip || {};
    this.rules = [];
  }

  Parser.prototype = {

    exec : function(rule) {
      this.next();
      return rule.match(this);
    },

    next : function() {
      var lex = this.lex;
      var skip = this.skip;
      while(skip[lex.next()] != undefined);
    }
  }

  return {
    Lexer             : Lexer,
    LexerRule         : LexerRule,
    Parser            : Parser,
    SimpleParserRule  : SimpleParserRule,
    BindingParserRule : BindingParserRule,
    AndRule           : AndRule,
    OrRule            : OrRule,
    CountRule         : CountRule
  };

});