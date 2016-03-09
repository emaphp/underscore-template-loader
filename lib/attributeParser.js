var path = require('path');
var url = require('url');
var Parser = require("fastparse");
var loaderUtils = require('loader-utils');

try {
    var _ = require('underscore');
} catch (e) {
    var _ = require('lodash');
}

// Reminder: path.isAbsolute is not available in 0.10.x
var pathIsAbsolute = function (attrValue) {
    return path.resolve(attrValue) == path.normalize(attrValue);
};

// Checks whether a string contains a template expression
var isTemplate = function (content) {
    // Test against regex list
    var interpolateTest = _.templateSettings.interpolate.test(content);
    
    if (interpolateTest) {
        _.templateSettings.interpolate.lastIndex = 0;
        return true;
    }
    
    var evaluateTest = _.templateSettings.evaluate.test(content);
    
    if (evaluateTest) {
        _.templateSettings.evaluate.lastIndex = 0;
        return true;
    }
    
    var escapeTest = _.templateSettings.escape.test(content);
    _.templateSettings.escape.lastIndex = 0;
    return escapeTest;
};

// AttributeContext class
var AttributeContext = function (isRelevantTagAttr, usid, root, parseDynamicRoutes) {
    this.currentDirective = null;
    this.matches = [];
    this.isRelevantTagAttr = isRelevantTagAttr;
    this.usid = usid;
    this.ident = function () {
        return "____" + usid + Math.random() + "____";
    };
    this.data = {};
    this.root = root;
    this.parseDynamicRoutes = parseDynamicRoutes;
};

AttributeContext.prototype.replaceMatches = function(content) {
    var self = this;
    content = [content];
    this.matches.reverse();
    
    this.matches.forEach(function (match) {
        if (isTemplate(match.value)) {
            // Replace attribute value
            // This is used if it contains a template expression and both the "root" and "parseDynamicRoutes"
            // were defined
            if (pathIsAbsolute(match.value) && self.root !== undefined) {
                var x = content.pop();
                content.push(x.substr(match.start + match.length));
                content.push(match.expression);
                content.push(x.substr(0, match.start));
            }
        } else {
            // Ignore if path is absolute and no root path has been defined
            if (pathIsAbsolute(match.value) && self.root === undefined) {
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
        }
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
        
        var url = self.data[match].value;
        
        // Make resource available through file-loader
        var fallbackLoader = require.resolve('../file-loader.js') + '?url=' + encodeURIComponent(url);
        return "' + require(" + JSON.stringify(fallbackLoader + '!' + loaderUtils.urlToRequest(url, self.root)) + ") + '";
    });
};

// Process a tag attribute
var processMatch = function (match, strUntilValue, name, value, index) {
    var self = this;
    var expression = value;
    
    if (!this.isRelevantTagAttr(this.currentTag, name)) {
        return;
    }

    // Try and set "root" directory when a dynamic attribute is found
    if (isTemplate(value)) {
        if (pathIsAbsolute(value) && self.root !== undefined && self.parseDynamicRoutes) {
            // Generate new value for replacement
            expression = loaderUtils.urlToRequest(value, self.root);
        }
    }
    
    this.matches.push({
        start: index + strUntilValue.length,
        length: value.length,
        value: value,
        expression: expression
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

module.exports = function parse(html, isRelevantTagAttr, usid, root, parseDynamicRoutes) {
    var context = new AttributeContext(isRelevantTagAttr, usid, root, parseDynamicRoutes);
    return parser.parse('outside', html, context);
};
