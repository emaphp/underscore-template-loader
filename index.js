var _ = require('underscore');
var loaderUtils = require('loader-utils');
var path = require('path');
var fs = require('fs');

function resolveContent(content, root) {
    var includeRegex = /<!--include\s+([\/\w\.]*?[\w]+\.[\w]+)-->/g;
    var matches = includeRegex.exec(content);

    while (matches != null) {
        var file = loaderUtils.urlToRequest(matches[1]);
        var basename = path.basename(file);
        var dirname = path.join(root, path.dirname(file));
        var rawContent = readFile(basename, dirname);
        content = content.replace(matches[0], rawContent);
        matches = includeRegex.exec(content);
    }

    return content;
}

function readFile(filepath, root) {
    var self = readFile;

    if (typeof(self.buffer) == "undefined") {
        self.buffer = {};
    }

    if (filepath in self.buffer) {
        return self.buffer[filepath];
    }
    
    var content = resolveContent(fs.readFileSync(path.join(root, filepath), 'utf8'), root);    
    self.buffer[filepath] = content;
    return self.buffer[filepath];
}

module.exports = function(content) {
    this.cacheable && this.cacheable();
    var callback = this.async();
    content = resolveContent(content, this.context);
    var fn = _.template(content);
    callback(null, "module.exports = " + fn.source + ";");
};

module.exports._ = _;