var loaderUtils = require('loader-utils');

var strRepeat = function (str, times) {
    var result = '';

    for (var i = 0; i < times; i++) {
        result += str;
    }

    return result;
};

// Used to translate require macros to override arguments
var objExtend = function (args, obj) {args = Array.prototype.slice.call(args);var _a = args.slice(1); _a.unshift(Object.assign(obj, args[0])); return _a;};

// Default macros
module.exports = {
    require: function (resourcePath, args) {
      var argsExpr = args ? '(' + objExtend + ')' + '(arguments, ' + JSON.stringify(args) + ')' : 'arguments';
      return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ").apply(null," + argsExpr + ")";
    },

    include: function (resourcePath) {
        return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ")";
    },

    br: function (times) {
        var str = strRepeat('<br>', typeof(times) == 'undefined' ? 1 : parseInt(times));
        return "'" + str + "'";
    },

    nl: function (times) {
        var str = strRepeat('\\n', typeof(times) == 'undefined' ? 1 : parseInt(times));
        return "'" + str + "'";
    }
};
