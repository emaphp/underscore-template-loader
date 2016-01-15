var path = require('path');
var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-string'));

var attributeParser = require('../lib/attributeParser');
var attributes = ['img:src', 'link:href'];

// Helper to test the attributeParser.
function testMatch(name, html, result) {
    it('should parse ' + name, function() {
        // The loader has an absolute path so we have to use a placeholder:

        var parsed = attributeParser(html, function(tag, attr) {
            return attributes.indexOf(tag + ':' + attr) != -1;
        }, 'ATTRIBUTE', '/asdf/');

        // We are only interested in the `value` property of `matches`.
        var values = parsed.matches.map(function(match) { return match.value; });
        assert.deepEqual(values, result);
    });
}

// Helper to test the replaceMatches function.
function replaceMatch(html) {
    return attributeParser(html, function(tag, attr) {
        return attributes.indexOf(tag + ':' + attr) != -1;
    }, 'ATTRIBUTE').replaceMatches(html);
}

// Testcases based on https://github.com/webpack/html-loader/blob/master/test/parserTest.js
describe('attribute parser', function() {
    testMatch('normal', 'Text <img src="image.png"><img src="image2.png">', ['image.png', 'image2.png']);
    testMatch('single-quotes', "Text <img src='image.png'><img src='image2.png'>", ['image.png', 'image2.png']);
    testMatch('whitespace', 'T ex t  <img \t  src =   "image.png"   >  <img\t\nsrc\n=\n"image2.png"\n>', ['image.png', 'image2.png']);
    testMatch('whitespace2', 'Text < img src="image.png" >', []);
    testMatch('wrong <', 'Text <<img src="image.png">', ['image.png']);
    testMatch("wrong >", 'Text ><img src="image.png">', ['image.png']);
    testMatch('no quot', '<img src=image.png>', ['image.png']);
    testMatch('first tag', '<img src="image.png">', ['image.png']);
    testMatch('comment', '<!--<img src="image.png">-->', []);
    testMatch('comment2', '<!--<!--<img src="image.png">-->', []);
    testMatch('comment3', '<!--><img src="image.png">-->', []);
    testMatch('comment4', '<!----><img src="image.png">-->', ['image.png']);
    testMatch('tags', '<img src="image.png"><script src="script.js"></script><link type="stylesheet" href="style.css">', ['image.png', 'style.css']);
    testMatch('cdata', '<![CDATA[<img src="image.png">]]><img src="image2.png">', ['image2.png']);
    testMatch('doctype', '<!doctype html><img src="image.png">', ['image.png']);

    it('should replace image paths', function() {
        var html = '<img src="image.png">';
        var result = replaceMatch(html);
        assert.startsWith(result, '<img src="____ATTRIBUTE');
    });

    it('should append url hash', function() {
        var html = '<img src="image.png#asdf">';
        var result = replaceMatch(html);
        assert.endsWith(result, '____#asdf">');
    });

    it('should not replace urls', function() {
        var html = '<img src="https://example.com/test.png">';
        var result = replaceMatch(html);
        assert.equal(result, html);
    });
});
