var fs = require('fs');
var path = require('path');

class WebpackLoaderMock {
  constructor(options) {
    this.context = options.context || '';
    this.query = options.query;
    this.options = options.options || {};
    this.resource = options.resource;
    this._asyncCallback = options.async;
    this._resolveStubs = options.resolveStubs || {};
  }

  async () {
    return this._asyncCallback;
  }
}

module.exports = WebpackLoaderMock;