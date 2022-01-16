module.exports = new class Util {
   constructor() {
      this.bindAll(this, Reflect.ownKeys(this.__proto__));
   }

   uuid(length = 30) {
      let uuid = '';

      do {
         const random = Math.random() * 16 | 0;
         uuid += (uuid.length == 12 ? 4 : (uuid.length == 16 ? (random & 3 | 8) : random)).toString(16);
      } while (uuid.length < length);

      return uuid;
   }

   bindAll(ctx, array) {
      if (!ctx || !['function', 'object'].includes(typeof ctx)) {
         throw new TypeError('bindAll\'s first argument must be of type function');
      } else if (!array || !Array.isArray(array)) {
         throw new TypeError('bindAll\'s second argument must be of type array');
      }

      array = array.filter(item => typeof item == 'string' && item != 'constructor');

      for (const item of array) {
         try {
            ctx[item] = ctx[item].bind(ctx);
         } catch (error) {
            throw new Error('one of the functions to bind does not exist or is not of type function');
         }
      }
   }

   parseStyleObject(style, line = false) {
      if (!style || (typeof style !== 'object' && !Array.isArray(style))) {
         throw new TypeError('parseStyleObject\'s first argument must be of type object');
      }

      return Object.entries(style).map(([a, b]) => `${a}: ${b};`).join(line ? '\n' : ' ');
   }
};