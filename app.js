requirejs( [ 'parser'], function(Parser) {

  function println(val) {
    window.document.write(val + '<br>');
  }

  var Matcher = Parser.Matcher;
  var Rule = Parser.Rule;

  var def =
  "WS  : '[ \t]'                   \n"+
  "ID  : '[a-zA-Z_][a-zA-Z_0-9]*'  \n"+
  "INT : '[0-9]+'                  \n"+
  "HEX : '0x[0-9a-fA-F]+'          \n"
  ;
  
  var defParser = new Matcher();
  defParser.addRule(/^[A-Z]+/,     'ID');
  defParser.addRule(/^:/,          'COL');
  defParser.addRule(/^\n/,         'NL');
  defParser.addRule(/^[ \t]+/,     'WS');

  m.setSource(def);

  while(m.next() != null) {
    println('\'' + m.value() + '\' - ' + m.rule().name);
  }
  
});
