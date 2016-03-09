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

describe('loader', function () {
    it('should load simple underscore template', function (done) {
        testTemplate(loader, 'simple.html', {}, function (output) {
            // Copy and paste the result of `console.log(output)` to templates/output/simple.txt
            assert.equal(output, loadOutput('simple.txt'));
            done();
        });
    });

    it('should prepend html comment', function (done) {
        testTemplate(loader, 'simple.html', {
            query: {
                prependFilenameComment: __dirname
            }
        }, function (output) {
            assert.equal(output, loadOutput('simple-with-comment.txt'));
            done();
        });
    });

    it('should use underscore as the engine when specified', function (done) {
        testTemplate(loader, 'simple.html', {
            query: {
                engine: 'underscore'
            }
        }, function (output) {
            assert.equal(output, loadOutput('simple-underscore.txt'));
            done();
        });
    });

    it('should use lodash as the engine when specified and include imports automatically', function (done) {
        testTemplate(loader, 'simple.html', {
            query: {
                engine: 'lodash'
            }
        }, function (output) {
            assert.equal(output, loadOutput('simple-lodash.txt'));
            done();
        });
    });

    it('should include the template imports when withImports is true', function (done) {
        testTemplate(loader, 'simple.html', {
            query: {
                withImports: true
            }
        }, function (output) {
            assert.equal(output, loadOutput('simple-with-imports.txt'));
            done();
        });
    });

    it('should NOT include template imports when withImports is false', function (done) {
        testTemplate(loader, 'simple.html', {
            query: {
                engine: 'lodash',
                withImports: false
            }
        }, function (output) {
            assert.equal(output, loadOutput('simple-lodash-no-imports.txt'));
            done();
        });
    });

    it('should be possible to require a template', function (done) {
        testTemplate(loader, 'require.html', {}, function (output) {
            assert.equal(output, loadOutput('require.txt'));
            done();
        });
    });

    it('should be possible to include a template', function (done) {
        testTemplate(loader, 'include.html', {}, function (output) {
            assert.equal(output, loadOutput('include.txt'));
            done();
        });
    });

    it('should require an image', function (done) {
        testTemplate(loader, 'image.html', {}, function (output) {
            assert.equal(output, loadOutput('image.txt'));
            done();
        });
    });

    it('should require given custom attributes', function (done) {
        testTemplate(loader, 'custom-attributes.html', {
            query: {
                attributes: ['img:src', 'link:href']
            }
        }, function (output) {
            assert.equal(output, loadOutput('custom-attributes.txt'));
            done();
        });
    });

    it('should not parse an absolute image without root option given', function (done) {
        testTemplate(loader, 'absolute-image.html', {}, function (output) {
            assert.equal(output, loadOutput('absolute-image.txt'));
            done();
        });
    });

    it('should parse an absolute image if root option is given', function (done) {
        testTemplate(loader, 'absolute-image.html', {
            query: {
                root: '/bar'
            }
        }, function (output) {
            assert.equal(output, loadOutput('absolute-image-with-root.txt'));
            done();
        });
    });

    it('should leave dynamic attributes unaltered', function (done) {
        testTemplate(loader, 'dynamic-attribute.html', {
            query: {
            }
        }, function (output) {
            assert.equal(output, loadOutput('dynamic-attribute.txt'));
            done();
        });
    });
    
    it('should leave dynamic attributes unaltered with root', function (done) {
        testTemplate(loader, 'dynamic-attribute-with-root.html', {
            query: {
                root: '/bar'
            }
        }, function (output) {
            assert.equal(output, loadOutput('dynamic-attribute-with-root.txt'));
            done();
        });
    });

    it('should parse dynamic attributes with parseDynamicRoutes', function (done) {
        testTemplate(loader, 'dynamic-attribute-with-parseDynamicRoutes.html', {
            query: {
                root: 'myapp',
                parseDynamicRoutes: true
            }
        }, function (output) {
            assert.equal(output, loadOutput('dynamic-attribute-with-parseDynamicRoutes.txt'));
            done();
        });
    });
    
    // FIXME: Changing the underscore tags changes it globally
    it('should allow custom underscore tags', function (done) {
        testTemplate(loader, 'custom-tags.html', {
            query: {
                interpolate: '\\{\\[(.+?)\\]\\}',
                evaluate: '\\{%([\\s\\S]+?)%\\}',
                escape: '\\{\\{(.+?)\\}\\}'
            }
        }, function (output) {
            assert.equal(output, loadOutput('custom-tags.txt'));
            done();
        });
    });
});
