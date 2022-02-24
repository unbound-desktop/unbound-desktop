const ref = Symbol.for('react.forward_ref');
const element = Symbol.for('react.element');
const memo = Symbol.for('react.memo');

function getNestedType(component) {
   if (!component) return null;

   const type = component.$$typeof;
   if (type === ref) {
      return getNestedType(component.render);
   } else if ([memo, element].includes(type)) {
      return getNestedType(component.type);
   }

   return component;
}

module.exports = getNestedType;