var fs = require('fs');
const path = require('path');
const chai = require('chai');
const assert = chai.assert;
chai.use(require('chai-string'));

const loader = require('../');
const WebpackLoaderMock = require('./lib/WebpackLoaderMock');
const loadTemplate = require('./lib/loadTemplate');
const loadOutput = require('./lib/loadOutput');

const testTemplate = (loader, template, options, testFn) => {
  loader.call(new WebpackLoaderMock({
    query: options.query,
    resource: path.join(__dirname, 'templates', template),
    options: options.options,
    async: function(_err, source) {
      testFn(source);
    }
  }), loadTemplate(template));
};

describe('loader', () => {
  it('should load simple underscore template', (done) => {
    testTemplate(loader, 'simple.html', {}, (output) => {
      // Copy and paste the result of `console.log(output)` to templates/output/simple.txt
      assert.equal(output, loadOutput('simple.txt'));
      done();
    });
  });

  it('should prepend html comment', (done) => {
    testTemplate(loader, 'simple.html', {
      query: {
        prependFilenameComment: __dirname
      }
    }, (output) => {
      assert.equal(output, loadOutput('simple-with-comment.txt'));
      done();
    });
  });

  it('should use underscore as the engine when specified', (done) => {
    testTemplate(loader, 'simple.html', {
      query: {
        engine: 'underscore'
      }
    }, (output) => {
      assert.equal(output, loadOutput('simple-underscore.txt'));
      done();
    });
  });

  it('should use lodash as the engine when specified and include imports automatically', (done) => {
    testTemplate(loader, 'simple.html', {
      query: {
        engine: 'lodash'
      }
    }, (output) => {
      assert.equal(output, loadOutput('simple-lodash.txt'));
      done();
    });
  });

  it('should include the template imports when withImports is true', (done) => {
    testTemplate(loader, 'simple.html', {
      query: {
        withImports: true
      }
    }, (output) => {
      assert.equal(output, loadOutput('simple-with-imports.txt'));
      done();
    });
  });

  it('should NOT include template imports when withImports is false', (done) => {
    testTemplate(loader, 'simple.html', {
      query: {
        engine: 'lodash',
        withImports: false
      }
    }, (output) => {
      assert.equal(output, loadOutput('simple-lodash-no-imports.txt'));
      done();
    });
  });

  it('should be possible to require a template', (done) => {
    testTemplate(loader, 'require.html', {}, (output) => {
      assert.equal(output, loadOutput('require.txt'));
      done();
    });
  });

  it('should be possible to require a template with custom args', (done) => {
    testTemplate(loader, 'require_with_args.html', {}, (output) => {
      assert.equal(output, loadOutput('require_with_args.txt'));
      done();
    });
  });

  it('should be possible to include a template', (done) => {
    testTemplate(loader, 'include.html', {}, (output) => {
      assert.equal(output, loadOutput('include.txt'));
      done();
    });
  });

  it('should require an image', (done) => {
    testTemplate(loader, 'image.html', {}, (output) => {
      assert.equal(output, loadOutput('image.txt'));
      done();
    });
  });

  it('should require given custom attributes', (done) => {
    testTemplate(loader, 'custom-attributes.html', {
      query: {
        attributes: ['img:src', 'link:href']
      }
    }, (output) => {
      assert.equal(output, loadOutput('custom-attributes.txt'));
      done();
    });
  });

  it('should not parse an absolute image without root option given', (done) => {
    testTemplate(loader, 'absolute-image.html', {}, (output) => {
      assert.equal(output, loadOutput('absolute-image.txt'));
      done();
    });
  });

  it('should parse an absolute image if root option is given', (done) => {
    testTemplate(loader, 'absolute-image.html', {
      query: {
        root: '/bar'
      }
    }, (output) => {
      assert.equal(output, loadOutput('absolute-image-with-root.txt'));
      done();
    });
  });

  it('should leave dynamic attributes unaltered', (done) => {
    testTemplate(loader, 'dynamic-attribute.html', {
      query: {}
    }, (output) => {
      assert.equal(output, loadOutput('dynamic-attribute.txt'));
      done();
    });
  });

  it('should leave dynamic attributes unaltered with root', (done) => {
    testTemplate(loader, 'dynamic-attribute-with-root.html', {
      query: {
        root: '/bar'
      }
    }, (output) => {
      assert.equal(output, loadOutput('dynamic-attribute-with-root.txt'));
      done();
    });
  });

  it('should parse dynamic attributes with parseDynamicRoutes', (done) => {
    testTemplate(loader, 'dynamic-attribute-with-parseDynamicRoutes.html', {
      query: {
        root: 'myapp',
        parseDynamicRoutes: true
      }
    }, (output) => {
      assert.equal(output, loadOutput('dynamic-attribute-with-parseDynamicRoutes.txt'));
      done();
    });
  });

  // // FIXME: Changing the underscore tags changes it globally
  it('should allow custom underscore tags', (done) => {
    testTemplate(loader, 'custom-tags.html', {
      query: {
        interpolate: '\\{\\[(.+?)\\]\\}',
        evaluate: '\\{%([\\s\\S]+?)%\\}',
        escape: '\\{\\{(.+?)\\}\\}'
      }
    }, (output) => {
      assert.equal(output, loadOutput('custom-tags.txt'));
      done();
    });
  });
});