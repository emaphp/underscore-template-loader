/* This loader returns the filename if no loader takes care of the file */
'use strict';

const {
  parseQuery
} = require('loader-utils');

module.exports = source => {
  if (this.cacheable) {
    this.cacheable();
  }
  const query = this.query instanceof Object ? this.query : parseQuery(this.query);
  const allLoadersButThisOne = this.loaders.filter((loader) => loader.module !== module.exports);

  // This loader shouldn't kick in if there is any other loader
  if (allLoadersButThisOne.length > 0) {
    return source;
  }

  return 'module.exports = ' + JSON.stringify(query.url);
};