var fs = require('fs');
var path = require('path');

function loadOutput(outputPath) {
    return fs.readFileSync(path.join(path.dirname(__dirname), 'templates/output', outputPath))
      .toString()
      .replace(/%%LOADER%%/g, require.resolve('../../file-loader.js'));
}

module.exports = loadOutput;