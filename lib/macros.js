const {
  urlToRequest
} = require('loader-utils');

// Used to translate require macros to override arguments
const objExtend = 'function(args,obj){args=Array.prototype.slice.call(args);var _a=args.slice(1);_a.unshift(Object.assign(obj,args[0]));return _a;}';

const _require = (resourcePath, args) => {
  const argsExpr = args ? '(' + objExtend + ')' + '(arguments, ' + JSON.stringify(args) + ')' : 'arguments';
  return "require(" + JSON.stringify(urlToRequest(resourcePath)) + ").apply(null," + argsExpr + ")";
};

const include = resourcePath => "require(" + JSON.stringify(urlToRequest(resourcePath)) + ")";

const repeat = (str, times) => "'" + Array.from({
    length: times || 1
  }, () => str).join('') +
  "'";

// Default macros
module.exports = {
  require: _require,
  include,
  repeat
};