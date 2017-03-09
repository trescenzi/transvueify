const compiler = require('vue-template-compiler');
const glob = require('glob');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');
const argv = require('./src/options');
const findConfig = require('find-config');

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

glob(options.input, (err, files) => {
  if (err) {
    console.log('Input glob provided failed to parse:\n', e.message);
    process.exit(1);
  }
  rimraf.sync(options.output);
  mkdirp.sync(options.output);

  files.forEach((filename) => {
    fs.readFile(filename, 'utf8', (err, file) => {
      if (err) {
        console.log(`Failed to read: ${filename}. It will be ignored.\n${err.message}`);
        return;
      }
      let parsedVueFile = compiler.parseComponent(file);
      if (options.plugins) {
        parsedVueFile = options.plugins.reduce((compiledFile, plugin) => require(plugin)(compiledFile, filename), parsedVueFile);
      } 

      const template = parsedVueFile.template ? `<template>${parsedVueFile.template.content}</template>` : '';
      const style = parsedVueFile.style ? `<style>${parsedVueFile.style.content}</style>` : '';
      const script = parsedVueFile.script ? `<script>${parsedVueFile.script.content}</script>` : '';
      const outFile = template + '\n' + script + '\n' + style;
      fs.writeFile(`${options.output}/${path.basename(filename)}`, outFile);
    });
  });
});
