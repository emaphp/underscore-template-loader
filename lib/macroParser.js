const Parser = require("fastparse");

// Macro class
class Macro {
  constructor(name, index, length) {
    this.name = name;
    this.start = index;
    this.length = length;
    this.args = [];
  }

  getArguments() {
    return this.args.map(arg => arg.value);
  }
}

class MacroContext {
  constructor(isAvailable, usid) {
    this.currentMacro = null;
    this.matches = [];
    this.isMacroAvailable = isAvailable;
    this.usid = usid;
    this.ident = () => "____" + usid + Math.random() + "____";
    this.data = {};
  }

  replaceMatches(content) {
    content = [content];
    this.matches.reverse();

    this.matches.forEach((match) => {
      let ident;
      do {
        ident = this.ident();
      } while (this.data[ident]);

      this.data[ident] = match;

      const x = content.pop();
      content.push(x.substr(match.start + match.length));
      content.push(ident);
      content.push(x.substr(0, match.start));
    });

    content.reverse();
    return content.join('');
  }

  resolveMacros(content, macros) {
    const regex = new RegExp('____' + this.usid + '[0-9\\.]+____', 'g');

    // Replace macro expressions
    content = content.replace(regex, (match) => {
      if (!this.data[match]) {
        return match;
      }

      const macro = this.data[match];
      return "' + " + macros[macro.name].apply(null, macro.getArguments()) + " + '";
    });

    // Replace escaped macros
    content = content.replace(/\\+(@\w+)/, (_match, expr) => expr);
    return content;
  }
}

// Parses a macro string argument
var processStringArg = function(match, value, index, length) {
  if (!this.currentMacro) return;
  this.currentMacro.args.push({
    start: index + value.length,
    index: index,
    length: length,
    value: value
  });
};

// Parses a macro numeric argument
const processNumArg = function(match, value, index, length) {
  if (!this.currentMacro) return;
  this.currentMacro.args.push({
    start: index + value.length,
    index: index,
    length: length,
    value: parseFloat(value)
  });
};

// Parses a macro boolean argument
const processBooleanArg = function(match, value, index, length) {
  if (!this.currentMacro) return;
  this.currentMacro.args.push({
    start: index + value.length,
    index: index,
    length: length,
    value: value === 'true'
  });
};

const processObjectArg = function(match, value, index, length) {
  if (!this.currentMacro) return;
  this.currentMacro.args.push({
    start: index + value.length,
    index: index,
    length: length,
    value: JSON.parse(value)
  });
};

// Parser configuration
const specs = {
  outside: {
    "^@(\\w+)\\(|([^\\\\])@(\\w+)\\(": function(match, name, prefix, _name, index, length) {
      name = name || _name;

      if (!this.isMacroAvailable(name)) {
        this.currentMacro = null;
        return 'inside';
      }

      const macro = new Macro(name, prefix ? index + 1 : index, length);
      this.matches.push(macro);
      this.currentMacro = macro;
      return 'inside';
    }
  },

  inside: {
    "\\)": function(match, index) {
      if (this.currentMacro !== null) {
        this.currentMacro.length = 1 + index - this.currentMacro.start;
      }
      return 'outside';
    },
    "\'([^\']*)\'": processStringArg,
    "\"([^\"]*)\"": processStringArg,
    "\\s*([\\d|\\.]+)\\s*": processNumArg,
    "\\s*(true|false)\\s*": processBooleanArg,
    "\\s*({.+})\\s*": processObjectArg,
    "\\s+": true
  }
};

const parser = new Parser(specs);

const parse = (html, isMacroAvailable, usid) => {
  const context = new MacroContext(isMacroAvailable, usid);
  return parser.parse('outside', html, context);
};

module.exports = parse;