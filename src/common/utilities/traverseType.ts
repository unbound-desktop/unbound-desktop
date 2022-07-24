import { ReactSymbols } from '@constants';

function traverseType(component: any): JSX.Element | undefined {
   if (!component) return null;

   const type = component.$$typeof;
   if (type === ReactSymbols.Ref) {
      return traverseType(component.render);
   } else if ([ReactSymbols.Memo, ReactSymbols.Element].includes(type)) {
      return traverseType(component.type);
   }

   return component;
}

export = traverseType;