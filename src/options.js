const argv = require('argv');

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
  description: 'Provide an output directory ',
  example: '--output=dist/ OR -o dist/',
});

module.exports = argv;
