var path = require('path');
var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-string'));

var loader = require('../');
var WebpackLoaderMock = require('./lib/WebpackLoaderMock');
var loadTemplate = require('./lib/loadTemplate');
const loadOutput = require('./lib/loadOutput');
const toText = require('./lib/toText.js');

const testTemplate = (loader, template, options, testFn) => {
  loader.call(new WebpackLoaderMock({
    query: options.query,
    resource: path.join(__dirname, 'templates', template),
    options: options.options,
    async: function(err, source) {
      testFn(source);
    }
  }), loadTemplate(template));
};

describe('macro', () => {
  it('should be parsed', (done) => {
    testTemplate(loader, 'custom-macro.html', {
      options: {
        macros: {
          foo: function() {
            return '"<p>bar</p>"';
          }
        }
      }
    }, (output) => {
      assert.equal(output, loadOutput('custom-macro.txt'));
      done();
    });
  });

  it('should invoke the repeat macro', (done) => {
    testTemplate(loader, 'repeat-macro.html', {
      options: {}
    }, (output) => {
      assert.equal(output, loadOutput('repeat-macro.txt'));
      done();
    });
  });

  it('should load macro from custom module', (done) => {
    testTemplate(loader, 'custom-macro-module.html', {
      options: {
        extend: './test/macros/macro-export'
      }
    }, (output) => {
      assert.equal(output, loadOutput('custom-macro-module.txt'));
      done();
    });
  });

  it('should receive boolean arguments', (done) => {
    testTemplate(loader, 'macro_boolean_args.html', {
      options: {
        macros: {
          bool_test: function(arg) {
            assert.typeOf(arg, 'boolean');
            return arg ? '"<p>TRUE</p>"' : '"<p>FALSE</p>"';
          }
        }
      }
    }, (output) => {
      assert.equal(output, loadOutput('macro_boolean_args.txt'));
      done();
    });
  });

  it('should receive numeric arguments', (done) => {
    testTemplate(loader, 'macro_numeric_args.html', {
      options: {
        macros: {
          num_test: function(arg) {
            assert.typeOf(arg, 'number');
            return '"<p>' + arg + '</p>"';
          }
        }
      }
    }, (output) => {
      assert.equal(output, loadOutput('macro_numeric_args.txt'));
      done();
    });
  });

  it('should receive string arguments', (done) => {
    testTemplate(loader, 'macro_string_args.html', {
      options: {
        macros: {
          str_test: function(arg) {
            assert.typeOf(arg, 'string');
            return '"<p>' + arg.toUpperCase() + '</p>"';
          }
        }
      }
    }, (output) => {
      assert.equal(output, loadOutput('macro_string_args.txt'));
      done();
    });
  });

  it('should receive object arguments', (done) => {
    testTemplate(loader, 'macro_object_args.html', {
      options: {
        macros: {
          object_test: function(arg) {
            assert.typeOf(arg, 'object');
            return '"' + toText(arg) + '"';
          }
        }
      }
    }, (output) => {
      assert.equal(output.trimRight(), loadOutput('macro_object_args.txt').trimRight());
      done();
    });
  });

  it('should receive argument list', (done) => {
    testTemplate(loader, 'macro_argument_list.html', {
      options: {
        macros: {
          numbers: function(first, second, third) {
            assert.typeOf(first, 'number');
            assert.typeOf(second, 'number');
            assert.typeOf(third, 'number');

            var output = '';
            for (var i = 0; i < arguments.length; i++) {
              output += '<p>' + arguments[i] + '</p>';
            }
            return '"' + output + '"';
          },

          booleans: function(first, second, third) {
            assert.typeOf(first, 'boolean');
            assert.typeOf(second, 'boolean');
            assert.typeOf(third, 'boolean');

            var output = '';
            for (var i = 0; i < arguments.length; i++) {
              output += '<p>' + (arguments[i] ? 'TRUE' : 'FALSE') + '</p>';
            }
            return '"' + output + '"';
          },

          strings: function(first, second, third) {
            assert.typeOf(first, 'string');
            assert.typeOf(second, 'string');
            assert.typeOf(third, 'string');

            var output = '';
            for (var i = 0; i < arguments.length; i++) {
              output += '<p>' + arguments[i].toLowerCase().replace(/"/g, "\\\"") + '</p>';
            }
            return '"' + output + '"';
          },

          mixed: function() {
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
    }, (output) => {
      assert.equal(output, loadOutput('macro_argument_list.txt'));
      done();
    });
  });

  it('should not be evaluated', (done) => {
    testTemplate(loader, 'disabled-macro.html', {
      query: {
        parseMacros: false
      }
    }, (output) => {
      assert.equal(output, loadOutput('disabled-macro.txt'));
      done();
    });
  });

  it('should be replaced when escaped', (done) => {
    testTemplate(loader, 'macro_escaped.html', {
      options: {
        macros: {
          unescaped: function() {
            return '"<p>Ok</p>"';
          }
        }
      }
    }, (output) => {
      assert.equal(output, loadOutput('macro_escaped.txt'));
      done();
    });
  });
});