const path = require('path');
const url = require('url');
const Parser = require("fastparse");
const {
  urlToRequest,
  isUrlRequest
} = require('loader-utils');

let _;

try {
  _ = require('underscore');
} catch (e) {
  _ = require('lodash');
}

// Reminder: path.isAbsolute is not available in 0.10.x
const pathIsAbsolute = attrValue => path.resolve(attrValue) == path.normalize(attrValue);

// Checks whether a string contains a template expression
const isTemplate = content => {
  // Test against regex list
  const interpolateTest = _.templateSettings.interpolate.test(content);

  if (interpolateTest) {
    _.templateSettings.interpolate.lastIndex = 0;
    return true;
  }

  const evaluateTest = _.templateSettings.evaluate.test(content);

  if (evaluateTest) {
    _.templateSettings.evaluate.lastIndex = 0;
    return true;
  }

  const escapeTest = _.templateSettings.escape.test(content);
  _.templateSettings.escape.lastIndex = 0;
  return escapeTest;
};

class AttributeContext {
  constructor(isRelevantTagAttr, usid, root, parseDynamicRoutes) {
    this.currentDirective = null;
    this.matches = [];
    this.isRelevantTagAttr = isRelevantTagAttr;
    this.usid = usid;
    this.ident = () => "____" + usid + Math.random() + "____";
    this.data = {};
    this.root = root;
    this.parseDynamicRoutes = parseDynamicRoutes;
  }

  replaceMatches(content) {
    content = [content];
    this.matches.reverse();

    this.matches.forEach(match => {
      if (isTemplate(match.value)) {
        // Replace attribute value
        // This is used if it contains a template expression and both the "root" and "parseDynamicRoutes"
        // were defined
        if (pathIsAbsolute(match.value) && this.root !== undefined) {
          const x = content.pop();
          content.push(x.substr(match.start + match.length));
          content.push(match.expression);
          content.push(x.substr(0, match.start));
        }
      } else {
        // Ignore if path is absolute and no root path has been defined
        if (pathIsAbsolute(match.value) && this.root === undefined) {
          return;
        }

        // Ignore if is a URL
        if (!isUrlRequest(match.value, this.root)) {
          return;
        }

        const uri = url.parse(match.value);
        if (uri.hash !== null && uri.hash !== undefined) {
          uri.hash = null;
          match.value = uri.format();
          match.length = match.value.length;
        }

        let ident;
        do {
          ident = this.ident();
        } while (this.data[ident]);

        this.data[ident] = match;

        const x = content.pop();
        content.push(x.substr(match.start + match.length));
        content.push(ident);
        content.push(x.substr(0, match.start));
      }
    });

    content.reverse();
    return content.join('');
  }

  resolveAttributes(content) {
    const regex = new RegExp('____' + this.usid + '[0-9\\.]+____', 'g');

    return content.replace(regex, match => {
      if (!this.data[match]) {
        return match;
      }

      const url = this.data[match].value;

      // Make resource available through file-loader
      const fallbackLoader = require.resolve('../file-loader.js') + '?url=' + encodeURIComponent(url);
      return "' + require(" + JSON.stringify(fallbackLoader + '!' + urlToRequest(url, this.root)) + ") + '";
    });

  }
}

// Process a tag attribute
const processMatch = function(match, strUntilValue, name, value, index) {
  var expression = value;

  if (!this.isRelevantTagAttr(this.currentTag, name)) {
    return;
  }

  // Try and set "root" directory when a dynamic attribute is found
  if (isTemplate(value)) {
    if (pathIsAbsolute(value) && this.root !== undefined && this.parseDynamicRoutes) {
      // Generate new value for replacement
      expression = urlToRequest(value, this.root);
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
const specs = {
  outside: {
    "<!--.*?-->": true,
    "<![CDATA[.*?]]>": true,
    "<[!\\?].*?>": true,
    "<\/[^>]+>": true,
    "<([a-zA-Z\\-:]+)\\s*": function(match, tagName) {
      this.currentTag = tagName;
      return 'inside';
    }
  },

  inside: {
    "\\s+": true, // Eat up whitespace
    ">": 'outside', // End of attributes
    "(([a-zA-Z\\-]+)\\s*=\\s*\")([^\"]*)\"": processMatch,
    "(([a-zA-Z\\-]+)\\s*=\\s*\')([^\']*)\'": processMatch,
    "(([a-zA-Z\\-]+)\\s*=\\s*)([^\\s>]+)": processMatch
  }
};

const parser = new Parser(specs);

module.exports = function parse(html, isRelevantTagAttr, usid, root, parseDynamicRoutes) {
  const context = new AttributeContext(isRelevantTagAttr, usid, root, parseDynamicRoutes);
  return parser.parse('outside', html, context);
};