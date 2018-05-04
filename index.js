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

function generateTagString(name, data) {
  if (!data) {
    return '';
  }

  const attrs = generateAttrString(data.attrs);
  return `<${name}${attrs}>\n${data.content}\n</${name}>`;
}

function generateStyleTags(styles) {
  return styles.reduce((tags, style) => {
    const tag = generateTagString('style', style);
    return`${tags}\n${tag}`;
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

      const template = generateTagString('template', parsedVueFile.template);
      const script = generateTagString('script', parsedVueFile.script);
      const style = generateStyleTags(parsedVueFile.styles);
      const outFile = `${template}\n${script}\n${style}`;

      let outputPath;

      if (options.output === 'inplace') {
        outputPath = path.basename(filename);
      } else {
        outputPath = path.resolve(options.output, filename.replace(options.basename, ''));
      }
      mkdirp.sync(path.dirname(outputPath));
      fs.writeFile('/Users/thomascrescenzi/transvueify/example/root/shit.js', outFile, (err) => {
        if (err) {
          console.error(`\nError transpiling ${filename}\n`);
          throw(err);
        }
      });
    });
  });
});
