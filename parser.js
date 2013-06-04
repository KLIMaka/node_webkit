define(['stl'], function(STL) {

  function Rule(patt, name) {
    this.pattern = patt;
    this.name = name;
  }
   
  Rule.prototype = {
  }

  function Matcher() {
 
    this.rulesByName = {};
    this.rulesByPatt = {};
    this.rules = [];
    this.src = '';
    this.offset = 0;
    this.eoi = false;

    this.matchedRule = null;
    this.matchedValue = null;
    
    this.rbegin = new STL.ArrayIterator(this.rules, 0);
    this.rend = new STL.ArrayIterator(this.rules, 0);
  }

  Matcher.prototype = {
    
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
      this.offset += len;

      if(matchedRule == null || this.offset >= this.src.length)
        this.eoi = true;

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

  return {
    Matcher : Matcher,
    Rule    : Rule
  };

});