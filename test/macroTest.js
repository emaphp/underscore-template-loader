var fs = require('fs');
var path = require('path');
var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-string'));

var loader = require('../');
var WebpackLoaderMock = require('./lib/WebpackLoaderMock');
var loadTemplate = require('./lib/loadTemplate');
var loadOutput = require('./lib/loadOutput');

function testTemplate(loader, template, options, testFn) {
    loader.call(new WebpackLoaderMock({
        query: options.query,
        resource: path.join(__dirname, 'templates', template),
        options: options.options,
        async: function (err, source) {
            testFn(source);
        }
    }), loadTemplate(template));
}

describe('macro', function () {
    it('should be parsed', function (done) {
        testTemplate(loader, 'custom-macro.html', {
            options: {
                macros: {
                    foo: function () {
                        return '"<p>bar</p>"';
                    }
                }
            }
        }, function (output) {
            assert.equal(output, loadOutput('custom-macro.txt'));
            done();
        });
    });

    it('should receive boolean arguments', function (done) {
        testTemplate(loader, 'macro_boolean_args.html', {
            options: {
                macros: {
                    bool_test: function (arg) {
                        assert.typeOf(arg, 'boolean');
                        return arg ? '"<p>TRUE</p>"' : '"<p>FALSE</p>"';
                    }
                }
            }
        }, function (output) {
            assert.equal(output, loadOutput('macro_boolean_args.txt'));
            done();
        });
    });

    it('should receive numeric arguments', function (done) {
        testTemplate(loader, 'macro_numeric_args.html', {
            options: {
                macros: {
                    num_test: function (arg) {
                        assert.typeOf(arg, 'number');
                        return '"<p>' + arg + '</p>"';
                    }
                }
            }
        }, function (output) {
            assert.equal(output, loadOutput('macro_numeric_args.txt'));
            done();
        });
    });

    it('should receive string arguments', function (done) {
        testTemplate(loader, 'macro_string_args.html', {
            options: {
                macros: {
                    str_test: function (arg) {
                        assert.typeOf(arg, 'string');
                        return '"<p>' + arg.toUpperCase() + '</p>"';
                    }
                }
            }
        }, function (output) {
            assert.equal(output, loadOutput('macro_string_args.txt'));
            done();
        });
    });

    it('should receive argument list', function (done) {
        testTemplate(loader, 'macro_argument_list.html', {
            options: {
                macros: {
                    numbers: function (first, second, third) {
                        assert.typeOf(first, 'number');
                        assert.typeOf(second, 'number');
                        assert.typeOf(third, 'number');
                        
                        var output = '';
                        for (var i = 0; i < arguments.length; i++) {
                            output += '<p>' + arguments[i] + '</p>';
                        }
                        return '"' + output + '"';
                    },

                    booleans: function (first, second, third) {
                        assert.typeOf(first, 'boolean');
                        assert.typeOf(second, 'boolean');
                        assert.typeOf(third, 'boolean');
                        
                        var output = '';
                        for (var i = 0; i < arguments.length; i++) {
                            output += '<p>' + (arguments[i] ? 'TRUE' : 'FALSE') + '</p>';
                        }
                        return '"' + output + '"';
                    },

                    strings: function (first, second, third) {
                        assert.typeOf(first, 'string');
                        assert.typeOf(second, 'string');
                        assert.typeOf(third, 'string');
                        
                        var output = '';
                        for (var i = 0; i < arguments.length; i++) {
                            output += '<p>' + arguments[i].toLowerCase().replace(/"/g, "\\\"") + '</p>';
                        }
                        return '"' + output + '"';
                    },

                    mixed: function () {
                        assert.equal(arguments.length, 6);
                        assert.typeOf(arguments[0], 'boolean');
                        assert.typeOf(arguments[1], 'number');
                        assert.typeOf(arguments[2], 'string');
                        assert.typeOf(arguments[3], 'boolean');
                        assert.typeOf(arguments[4], 'string');
                        assert.typeOf(arguments[5], 'number');

                        var output = '';

                        for (var i = 0; i < arguments.length; i++) {
                            var type = typeof(arguments[i]);

                            if (type == 'string') {
                                output += '<p>' + arguments[i].toLowerCase().replace(/"/g, "\\\"") + '</p>';
                            } else if (type == 'number') {
                                output += '<p>' + arguments[i] + '</p>';
                            } else if (type == 'boolean') {
                                output += '<p>' + (arguments[i] ? 'TRUE' : 'FALSE') + '</p>';
                            }
                        }

                        return '"' + output + '"';

                    }
                }
            }
        }, function (output) {
            assert.equal(output, loadOutput('macro_argument_list.txt'));
            done();
        });
    });

    it('should not be evaluated', function (done) {
        testTemplate(loader, 'macro.html', {
            query: {
                parseMacros: false
            }
        }, function (output) {
            assert.equal(output, loadOutput('disabled-macro.txt'));
            done();
        });
    });

    it('should be replaced when escaped', function (done) {
        testTemplate(loader, 'macro_escaped.html', {
            options: {
                macros: {
                    unescaped: function () {
                        return '"<p>Ok</p>"';
                    }
                }
            }
        }, function (output) {
            assert.equal(output, loadOutput('macro_escaped.txt'));
            done();
        });
    });
});