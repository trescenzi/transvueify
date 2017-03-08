const compiler = require('vue-template-compiler');
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

let pluginsIndex = process.argv.indexOf('--plugins');
if (pluginsIndex !== -1) {
  remainingOptions = process.argv.slice(pluginsIndex + 1);
  options.plugins = [remainingOptions[0]];
  let i = 1;
  while (remainingOptions[i].charAt(0) !== '-') {
    options.plugins.push(remainingOptions[i]);
    i++;
  }
}

if (!options.input) {
  throw new Error('Please provide input files either via transvueify.config.json or the --input flag');
}
console.log(options);

if (!options.output) {
  throw new Error('Please provide output files either via transvueify.config.json or the --output flag');
}

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
      let parsedVueFile = compiler.parseComponent(file);
      if (options.plugins) {
        parsedVueFile = options.plugins.reduce((compiledFile, plugin) => require(plugin)(compiledFile), parsedVueFile);
      } 

      const template = parsedVueFile.template ? `<template>${parsedVueFile.template.content}</template>` : '';
      const style = parsedVueFile.style ? `<style>${parsedVueFile.style.content}</style>` : '';
      const script = parsedVueFile.script ? `<script>${parsedVueFile.script.content}</script>` : '';
      const outFile = template + '\n' + script + '\n' + style;
      fs.writeFile(`${options.output}/${path.basename(filename)}`, outFile);
    });
  });
});
