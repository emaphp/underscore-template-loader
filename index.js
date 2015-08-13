var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var url = require("url");
var loaderUtils = require('loader-utils');
var attributeParser = require('./parser');

module.exports = function () {
	var includeRegex = /<@include\s+([\/\w\.]*?[\w]+\.[\w]+)>/g;

    // Returns a template file content
	var readFile = function(filepath, root) {
		var self = readFile;
		self.buffer = self.buffer || {};

		if (filepath in self.buffer) {
			return self.buffer[filepath];
        }

		var content = readContent(fs.readFileSync(path.join(root, filepath), 'utf8'), root);
		self.buffer[filepath] = content;
		return self.buffer[filepath];
	};

    // Parses an external file content
	var readContent = function(content, root) {
		var matches = includeRegex.exec(content);

		while (matches != null) {
			var file = loaderUtils.urlToRequest(matches[1]);
			var rawContent = readFile(path.basename(file), path.join(root, path.dirname(file)));
			content = content.replace(matches[0], rawContent);
			matches = includeRegex.exec(content);
		}

		return content;
	};

	return function(content) {
        var query = loaderUtils.parseQuery(this.query);
        var root = query.root;
        var attributes = ['img:src'];

        if (_.isObject(query)) {
			// Apply template settings
			_.each(_.pick(query, 'interpolate', 'escape', 'evaluate'), function (value, key) {
				_.templateSettings[key] = new RegExp(value, 'g');
			});

            // Set tag+attribute to parse for external resources
            if (query.attributes !== undefined) {
                attributes = _.isArray(query.attributes) ? query.attributes : [];
            }

            // Set include regex
            if (query.includeRegex !== undefined) {
                includeRegex = new RegExp(query.includeRegex, 'g');
            }
		}

        // Generates a random string for further proccessing
        var randomIdent = function () {
            return "@@@URL" + Math.random() + "@@@";
        };

        // Obtain external resource links
        var links = attributeParser(content, function (tag, attr) {
            return attributes.indexOf(tag + ':' + attr) >= 0;
        });
        links.reverse();

        // Parse external resources
        var data = {};
        content = [content];
        links.forEach(function (link) {
            // Ignore absolute paths
            if (/^\//.exec(link.value) && root == false) {
                return;
            }

            if (!loaderUtils.isUrlRequest(link.value, root)) {
                return;
            }

            var uri = url.parse(link.value);
            if (uri.hash !== null && uri.hash !== undefined) {
                uri.hash = null;
                link.value = uri.format();
                link.length = link.value.length;
            }

            do {
                var ident = randomIdent();
            } while (data[ident]);

            data[ident] = link.value;
            var x = content.pop();
            content.push(x.substr(link.start + link.length));
            content.push(ident);
            content.push(x.substr(0, link.start));
        });
        content.reverse();
        content = content.join('');

		this.cacheable && this.cacheable();
		var callback = this.async();

        // Read file content
		content = readContent(content, this.context);

        // Replace random generated strings with require
        var source = _.template(content).source;
        content = source.replace(/@@@URL[0-9\.]+@@@/g, function (match) {
            if (!data[match]) {
                return match;
            }

            return "' + require(" + JSON.stringify(loaderUtils.urlToRequest(data[match], root)) + ") + '";
        });

		callback(null, "module.exports = " + content + ";");
	};
}();

module.exports._ = _;
