const DOM = require('@utilities/dom');
const { readdirSync } = require('fs');
const { resolve } = require('path');

const path = resolve(__dirname, '..', '..', 'styles');
const styles = {};

readdirSync(path).map(file => {
   const items = file.split('.');
   if (items.length != 1) items.splice(items.length - 1, 1);

   const name = items.join('.');
   styles[name] = require(`${path}/${file}`);
});

module.exports = class Styles {
   constructor() {
      this.styles = styles;
      this.applied = [];
   }

   apply() {
      for (const key in this.styles) {
         this.applied.push(DOM.appendStyle(`unbound-core-${key}`, styles[key]));
      }
   }

   remove() {
      for (const style of this.applied) {
         style.remove();
      }
   }
};