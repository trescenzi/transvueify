const compiler = require('vue-template-compiler');
const glob = require('glob');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');
const options = require('./src/options');

function generateAttrString(attrHash) {
  return Object.keys(attrHash).reduce((attrs, name) => {
    const value = attrHash[name];
    const attr = typeof value === 'boolean' ? name : `${name}="${value}"`;
    return `${attrs} ${attr}`;
  }, '');
}

function generateStyleTags(styles) {
  return styles.reduce((styles, parsedStyle) => {
    const attrs = generateAttrString(attrHash);
    const style = `<style${attrs}>${parsedStyle.content}</style>`;
    return `${styles}\n${style}`;
  }, '');
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
          /* eslint global-require: 0, 'import/no-dynamic-require': 0 */
          (compiledFile, plugin) => require(plugin)(compiledFile, filename), parsedVueFile);
      }

      const template = parsedVueFile.template ? `<template>${parsedVueFile.template.content}</template>` : '';
      const style = parsedVueFile.styles ? generateStyleTags(parsedVueFile.styles) : '';
      const script = parsedVueFile.script ? `<script>${parsedVueFile.script.content}</script>` : '';
      const outFile = `${template}\n${script}\n${style}`;

      let outputPath;

      if (options.output === 'inplace') {
        outputPath = path.basename(filename);
      } else {
        outputPath = path.resolve(options.output, filename.replace(options.basename, ''));
      }
      mkdirp.sync(path.dirname(outputPath));
      fs.writeFile(outputPath, outFile);
    });
  });
});
