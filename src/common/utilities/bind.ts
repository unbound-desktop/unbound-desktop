/**
 * @name bind
 * @description TypeScript decorator to auto-bind functions in classes.
 */

function bind(target: any, key: string, descriptor: Record<string, any>): PropertyDescriptor {
   let payload = descriptor.value;

   if (typeof payload !== 'function') {
      throw new TypeError('bind can only be used on functions');
   }

   return {
      configurable: true,
      get() {
         if (this === target.prototype || this.hasOwnProperty(key) || typeof payload !== 'function') {
            return payload;
         }

         const bound = payload.bind(this);
         Object.defineProperty(this, key, {
            configurable: true,
            get() {
               return bound;
            },
            set(value) {
               payload = value;
               delete this[key];
            }
         });

         return bound;
      },
      set(value) {
         payload = value;
      }
   };
}

export = bind;