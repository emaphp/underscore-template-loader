var Parser = require("fastparse");

var processMatch = function (match, strUntilValue, name, value, index) {
    if (!this.isRelevantTagAttr(this.currentTag, name)) {
        return;
    }

    this.matches.push({
        start: index + strUntilValue.length,
        length: value.length,
        value: value
    });
};

var parser = new Parser({
    outside: {
        "<([a-zA-Z\\-:]+)\\s*": function (match, tagName) {
            this.currentTag = tagName;
            return 'inside';
        }
    },
    inside: {
        "\\s+": true,   // Eat up whitespace
        ">": 'outside', // End of attributes
        "(([a-zA-Z\\-]+)\\s*=\\s*\")([^\"]*)\"": processMatch,
        "(([a-zA-Z\\-]+)\\s*=\\s*\')([^\']*)\'": processMatch,
        "(([a-zA-Z\\-]+)\\s*=\\s*)([^\\s>]+)": processMatch
    }
});

module.exports = function parse (html, isRelevantTagAttr) {
    return parser.parse('outside', html, {
        currentTag: null,
        matches: [],
        isRelevantTagAttr: isRelevantTagAttr
    }).matches;
};
