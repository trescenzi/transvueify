const compiler = require('vue-template-compiler');
const glob = require('glob');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');
const options = require('./src/options');

function generateStyleTags(styles) {
  return styles.reduce((styles, style) => `${styles}\n<style lang="${style.lang}">${style.content}</style>`, '');
}

glob(options.input, (err, files) => {
  if (err) {
    console.log('Input glob provided failed to parse:\n', err.message);
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
        parsedVueFile = options.plugins.reduce(
          /* eslint global-require: "ignore" */
          (compiledFile, plugin) => require(plugin)(compiledFile, filename), parsedVueFile);
      }

      const template = parsedVueFile.template ? `<template>${parsedVueFile.template.content}</template>` : '';
      const style = parsedVueFile.styles ? generateStyleTags(parsedVueFile.styles) : '';
      const script = parsedVueFile.script ? `<script>${parsedVueFile.script.content}</script>` : '';
      const outFile = `${template}\n${script}\n${style}`;

      let outputPath = `${options.output}/${filename.replace(options.basename, '')}`;
      if (options.output === 'inplace') {
        outputPath = path.basename(filename);
      }
      fs.writeFile(outputPath, outFile);
    });
  });
});
