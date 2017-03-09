# Transvueify: The easy to use `.vue` to `.vue` build tool

Transvueify will take your complex and JS feature filled `.vue`
files and compile them down to however simple JS you're looking for.
The JS inside of the `<script>` in you `.vue` files will be passed
through your desired plugins, such as [transvueify-plugin-babel](https://github.com/trescenzi/transvueify-plugin-babel) ,
and come out as transpiled `.vue` files on the other end. As many files go in will come out. This tool
doesn't do any bundling. It simply transforms your `.vue` files mostly
in place for use either by other tools of to be distributed directly.

The most basic usage is to simple:
`npm install --save-dev transvueify`
`transvueify --input src/**/*.vue --output dist/`

## Config

Instead of providing command line options to transvueify options
can be provided via a `transvueify.config.json` file.

```js
{
  "input": "src/**/*.vue",
  "output": "dist/",
  "plugins": ["transvueify-plugin-babel"]
}
```
