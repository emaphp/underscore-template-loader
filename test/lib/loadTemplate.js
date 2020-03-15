var fs = require('fs');
var path = require('path');

const loadTemplate = templatePath => {
  return fs.readFileSync(path.join(path.dirname(__dirname), 'templates', templatePath)).toString();
};

module.exports = loadTemplate;