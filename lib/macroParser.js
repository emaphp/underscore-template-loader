var Parser = require("fastparse");

// Macro class
var Macro = function (name, index, length) {
    this.name = name;
    this.start = index;
    this.length = length;
    this.args = [];
};

Macro.prototype.getArguments = function() {
    var args = [];

    this.args.forEach(function (arg) {
        args.push(arg.value);
    });

    return args;
};

// MacroContext class
var MacroContext = function (isMacroAvailable, usid) {
    this.currentMacro = null;
    this.matches = [];
    this.isMacroAvailable = isMacroAvailable;
    this.usid = usid;
    this.ident = function () {
        return "____" + usid + Math.random() + "____";
    };
    this.data = {};
};

MacroContext.prototype.replaceMatches = function(content) {
    var self = this;
    content = [content];
    this.matches.reverse();
    
    this.matches.forEach(function (match) {
        do {
            var ident = self.ident();
        } while (self.data[ident]);

        self.data[ident] = match;

        var x = content.pop();
        content.push(x.substr(match.start + match.length));
        content.push(ident);
        content.push(x.substr(0, match.start));
    });

    content.reverse();    
    return content.join('');
};

MacroContext.prototype.resolveMacros = function (content, macros) {
    var regex = new RegExp('____' + this.usid + '[0-9\\.]+____', 'g');
    var self = this;

    // Replace macro expressions
    content = content.replace(regex, function (match) {
        if (!self.data[match]) {
            return match;
        }

        var macro = self.data[match];
        return "' + " +  macros[macro.name].apply(null, macro.getArguments()) + " + '";
    });

    // Replace escaped macros
    content = content.replace(/\\+(@\w+)/, function (match, expr) {
        return expr;
    });

    return content;
};

// Parses a macro string argument
var processStringArg = function (match, value, index, length) {
    if (!this.currentMacro) return;
    this.currentMacro.args.push({
        start: index + value.length,
        index: index,
        length: length,
        value: value
    });
};

// Parses a macro numeric argument
var processNumArg = function (match, value, index, length) {
    if (!this.currentMacro) return;
    this.currentMacro.args.push({
        start: index + value.length,
        index: index,
        length: length,
        value: parseFloat(value)
    });
};

// Parses a macro boolean argument
var processBooleanArg = function (match, value, index, length) {
    if (!this.currentMacro) return;
    this.currentMacro.args.push({
        start: index + value.length,
        index: index,
        length: length,
        value: value === 'true'
    });
};

// Parser configuration
var specs = {
    outside: {
        "^@(\\w+)\\(|([^\\\\])@(\\w+)\\(": function (match, name, prefix, _name, index, length) {
            var name = name || _name;

            if (!this.isMacroAvailable(name)) {
                this.currentMacro = null;
                return 'inside';
            }

            var macro = new Macro(name, prefix ? index + 1 : index, length);
            this.matches.push(macro);
            this.currentMacro = macro;
            return 'inside';
        }
    },

    inside: {
        "\\)": function (match, index) {
            if (this.currentMacro !== null) {
                this.currentMacro.length = 1 + index - this.currentMacro.start;
            }
            return 'outside';
        },
        "\'([^\']*)\'": processStringArg,
        "\"([^\"]*)\"": processStringArg,
        "\\s*([\\d|\\.]+)\\s*": processNumArg,
        "\\s*(true|false)\\s*": processBooleanArg,
        "\\s+": true
    }
};

var parser = new Parser(specs);

module.exports = function parse(html, isMacroAvailable, usid) {
    var context = new MacroContext(isMacroAvailable, usid);
    return parser.parse('outside', html, context);
};