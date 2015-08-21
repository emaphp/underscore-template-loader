var fs = require('fs');
var path = require('path');

function WebpackLoaderMock (options) {
    this.context = options.context || '';
    this.query = options.query;
    this.options = options.options || {};
    this.resource = options.resource;
    this._asyncCallback = options.async;
    this._resolveStubs = options.resolveStubs || {};
}

WebpackLoaderMock.prototype.async = function () {
    return this._asyncCallback;
};

module.exports = WebpackLoaderMock;
