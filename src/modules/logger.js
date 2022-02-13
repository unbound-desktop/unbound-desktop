const { parseStyleObject } = require('@utilities');
const { console } = require('@constants');

module.exports = class Logger {
   constructor(...name) {
      this.name = ['Unbound', ...name];

      const tag = this.name.map(n => `%c${n}`);

      Object.entries(console).map(([type, style]) => {
         const styles = [];

         tag.map((_, index) => {
            const isLast = index == tag.length - 1;

            if (isLast) {
               style['margin-right'] = '0px';
            } else {
               style['margin-right'] = '5px';
            }

            styles.push(parseStyleObject(style));
         });

         const handler = (...args) => window.console[type](
            tag.join(''),
            ...styles,
            ...args
         );

         this[type] = handler.bind(this);
      });
   }
};