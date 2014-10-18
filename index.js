var _ = require('underscore');

module.exports = function(content) {
    this.cacheable && this.cacheable();
    var callback = this.async();
    var fn = _.template(content);
    callback(null, "module.exports = " + fn+ ";");
};

module.exports._ = _;