var loaderUtils = require('loader-utils');

var strRepeat = function (str, times) {
    var result = '';

    for (var i = 0; i < times; i++) {
        result += str;
    }

    return result;
};

// Default macros
module.exports = {
    require: function (resourcePath) {
        return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ").apply(null,arguments)";
    },

    include: function (resourcePath) {
        return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ")";
    },

    br: function (times) {
        var str = strRepeat('<br>', typeof(times) == 'undefined' ? 1 : parseInt(times));
        return "'" + str + "'";
    },

    nl: function () {
        var str = strRepeat('\\n', typeof(times) == 'undefined' ? 1 : parseInt(times));
        return "'" + str + "'";
    }
};
