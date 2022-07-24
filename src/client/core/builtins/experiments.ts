import { findByProps } from '@webpack';

const Developer = findByProps('isDeveloper');

export const data = {
   name: 'Experiments',
   id: 'dev.experiments',
   default: false,
   wait: false
};

export function initialize() {
   Developer._isDeveloper = Developer.isDeveloper;
   Object.defineProperty(Developer, 'isDeveloper', {
      configurable: true,
      get: () => true,
      set: (value) => {
         delete Developer.isDeveloper;

         Object.defineProperty(Developer, 'isDeveloper', {
            get: () => value,
            configurable: true
         });
      },
   });

   setImmediate(Developer.emitChange.bind(Developer));
}

export function shutdown() {
   if (Developer._isDeveloper !== void 0) {
      Developer.isDeveloper = Developer._isDeveloper;
   }

   setImmediate(Developer.emitChange.bind(Developer));
}