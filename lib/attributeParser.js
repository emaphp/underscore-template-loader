var path = require('path');
var url = require('url');
var Parser = require("fastparse");
var loaderUtils = require('loader-utils');

// AttributeContext class
var AttributeContext = function (isRelevantTagAttr, usid, root) {
    this.currentDirective = null;
    this.matches = [];
    this.isRelevantTagAttr = isRelevantTagAttr;
    this.usid = usid;
    this.ident = function () {
        return "____" + usid + Math.random() + "____";
    };
    this.data = {};
    this.root = root;
};

AttributeContext.prototype.replaceMatches = function(content) {
    var self = this;
    content = [content];
    this.matches.reverse();

    this.matches.forEach(function (match) {
        // Ignore if path is absolute and no root path has been defined
        // Reminder: path.isAbsolute is not available in 0.10.x
        if ((path.resolve(match.value) == path.normalize(match.value)) && self.root === undefined) {
            return;
        }

        // Ignore if is a URL
        if (!loaderUtils.isUrlRequest(match.value, self.root)) {
            return;
        }

        var uri = url.parse(match.value);
        if (uri.hash !== null && uri.hash !== undefined) {
            uri.hash = null;
            match.value = uri.format();
            match.length = match.value.length;
        }

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

AttributeContext.prototype.resolveAttributes = function (content) {
    var regex = new RegExp('____' + this.usid + '[0-9\\.]+____', 'g');
    var self = this;
    return content.replace(regex, function (match) {
        if (!self.data[match]) {
            return match;
        }
        var url = (self.data[match].value);
        var fallbackLoader = require.resolve('../file-loader.js') + '?url=' + encodeURIComponent(url);
        return "' + require(" + JSON.stringify(fallbackLoader + '!' + loaderUtils.urlToRequest(url, self.root)) + ") + '";
    });
};

// Process a tag attribute
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

// Parser configuration
var specs = {
    outside: {
        "<!--.*?-->": true,
        "<![CDATA[.*?]]>": true,
        "<[!\\?].*?>": true,
        "<\/[^>]+>": true,
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
};

var parser = new Parser(specs);

module.exports = function parse(html, isRelevantTagAttr, usid, root) {
    var context = new AttributeContext(isRelevantTagAttr, usid, root);
    return parser.parse('outside', html, context);
};
