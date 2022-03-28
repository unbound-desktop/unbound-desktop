const { ReactSymbols } = require('../constants');

function traverseType(component) {
   if (!component) return null;

   const type = component.$$typeof;
   if (type === ReactSymbols.Ref) {
      return traverseType(component.render);
   } else if ([ReactSymbols.Memo, ReactSymbols.Element].includes(type)) {
      return traverseType(component.type);
   }

   return component;
}

module.exports = traverseType;