// Transforms a value to an expected text
function toText (value) {
  if (value instanceof Array) {
    return value.map(toText).join(',');
  } else if (value instanceof Object) {
    var str = '';
    for (var k in value) {
      str += ('<' + k + '>' + toText(value[k]) + '</' + k + '>');
    }
    return str;
  } else {
    return value + '';
  }
}

module.exports = toText;
