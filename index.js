const compiler = require('vue-template-compiler');
const babel = require('babel-core');
const glob = require('glob');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');

let options = {};
try {
  options = JSON.parse(fs.readFileSync('./transvueify.config.json', 'utf8'));
} catch(e) {};

let inputIndex = process.argv.indexOf('--input');
if (inputIndex !== -1) {
  options.input = process.argv[inputIndex + 1];
}

let outputIndex = process.argv.indexOf('--output');
if (outputIndex !== -1) {
  options.output = process.argv[outputIndex + 1];
}

if (!options.input) {
  throw new Error('Please provide input files either via transvueify.config.json or the --input flag');
}

if (!options.output) {
  throw new Error('Please provide output files either via transvueify.config.json or the --output flag');
}

console.log(options);
glob(options.input, (err, files) => {
  if (err) {
    throw err;
  }
  rimraf.sync(options.output);
  mkdirp.sync(options.output);

  files.forEach((filename) => {
    console.log(filename);
    fs.readFile(filename, 'utf8', (err, file) => {
      if (err) {
        throw err;
      }

      const parsedVueFile = compiler.parseComponent(file);
      const template = parsedVueFile.template ? `<template>${parsedVueFile.template.content}</template>` : '';
      const style = parsedVueFile.style ? `<style>${parsedVueFile.style.content}</style>` : '';
      const babelfiedScript = `<script>${babel.transform(parsedVueFile.script.content).code}\n</script>`;
      const outFile = template + '\n' + babelfiedScript + '\n' + style;
      fs.writeFile(`${options.output}/${path.basename(filename)}`, outFile);
    });
  });
});
