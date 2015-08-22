var fs = require('fs');
var path = require('path');

function loadTemplate(templatePath) {
    return fs.readFileSync(path.join(path.dirname(__dirname), 'templates', templatePath)).toString();
}

module.exports = loadTemplate;