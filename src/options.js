const argv = require('argv');
const findConfig = require('find-config');

argv.option({
  name: 'input',
  short: 'i',
  type: 'string',
  description: 'Provide a blob for input files',
  example: '--input=src/**/*.vue OR -i src/**/*.vue',
});

argv.option({
  name: 'output',
  short: 'o',
  type: 'string',
  description: 'Provide an output directory or `inplace`',
  example: '--output=dist/ OR -o dist/',
});

argv.option({
  name: 'basepath',
  short: 'b',
  type: 'string',
  description: 'Provide the base path for your output. This path gets removed'+
               ' front the output file structure. Defaults to "" keeping the full path intact',
  example: '--basepath=src/ OR -b src/',
});

let options = argv.run().options;

const configFile = findConfig.read('transvueify.config.json');
if (configFile) {
  let configJson;
  try {
    configJson = JSON.parse(configFile);
  } catch(e) {
    console.log('Invalid JSON config provided:\n', e.message);
    process.exit(1);
  }

  options = Object.assign(configJson, options);
}

if (!options.input) {
  throw new Error('Please provide input files either via transvueify.config.json or the -i flag');
}

if (!options.output) {
  throw new Error('Please provide output files either via transvueify.config.json or the -o flag');
}

if (!options.basepath) {
  options.basepath = '';
}

module.exports = options;
