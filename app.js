requirejs( ['parser'], function(P) {

  function println(val) {
    window.document.write(val + '<br>');
  }

  var Lexer = P.Lexer;
  var LexerRule = P.LexerRule;
  var Parser = P.Parser;
  var BPR = P.BindingParserRule;
  var And = P.AndRule;
  var Or = P.OrRule;
  var SPR = P.SimpleParserRule;
  var Count = P.CountRule;

  var def =
  "WS  ; '[ \t]'                   \n"+
  "ID  : '[a-zA-Z_][a-zA-Z_0-9]*'  \n"+
  "INT : '[0-9]+'                  \n"+
  "HEX : '0x[0-9a-fA-F]+'          \n"+
  "REF : ID                        \n"
  ;
  
  var defLex = new Lexer();
  defLex.addRule(new LexerRule(/^[A-Z]+/,     'ID'));
  defLex.addRule(new LexerRule(/^:/,          'COL'));
  defLex.addRule(new LexerRule(/^;/,          'SCOL'));
  defLex.addRule(new LexerRule(/^\n/,         'NL'));
  defLex.addRule(new LexerRule(/^[ \t]+/,     'WS'));
  defLex.addRule(new LexerRule(/^'[^']*'+/,   'RULE'));
  defLex.setSource(def);

  var p = new Parser(defLex, {'WS':0});
  var ID = new SPR('ID');
  var RULE = new SPR('RULE');
  var COL = new SPR('COL');
  var SCOL = new SPR('SCOL');
  var NL = new SPR('NL');

  var r = new Count(new And([new BPR('id', ID), new Or([COL, SCOL]), new BPR('val', new Or([RULE, ID])), NL]), 1, 0);

  console.log(p.exec(r).get());
});
