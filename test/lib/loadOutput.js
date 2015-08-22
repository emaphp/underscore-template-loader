var fs = require('fs');
var path = require('path');

function loadOutput(outputPath) {
    return fs.readFileSync(path.join(path.dirname(__dirname), 'templates/output', outputPath)).toString();
}

module.exports = loadOutput;