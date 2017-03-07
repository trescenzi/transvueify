const compiler = require('vue-template-compiler');
const babel = require('babel-core');
const glob = require('glob');
const fs = require('fs');

const options = JSON.parse(fs.readFileSync('./transvueify.config.json', 'utf8'));
console.log(options);
glob(options.input, (err, files) => {
  if (err) {
    throw err;
  }

  files.forEach((filename) => {
    console.log(filename);
    fs.readFile(filename, 'utf8', (err, file) => {
      if (err) {
        throw err;
      }

      const parsedVueFile = compiler.parseComponent(file);
      const template = parsedVueFile.template ? `<template>${parsedVueFile.template.content}</template>` : '';
      const style = parsedVueFile.style ? `<style>${parsedVueFile.style.content}</style>` : '';
      const babelfiedScript = `<script>${babel.transform(parsedVueFile.script.content).code}</script>`;
      const outFile = template + '\n' + babelfiedScript + style;
      fs.writeFile('dist', outFile);
    });
  });
});

