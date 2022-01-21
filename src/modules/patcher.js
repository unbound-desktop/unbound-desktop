const { bindAll } = require('@utilities');
const { logger } = require('@modules');

const Logger = new logger('Patcher');

module.exports = new class Patcher {
   constructor() {
      this.patches = [];

      bindAll(this, ['unpatchAll', 'after', 'before', 'instead']);
   }

   getPatchesByCaller(id) {
      if (!id) return [];
      const patches = [];

      for (const patch of this.patches) {
         for (const child of patch.patches) {
            if (child.caller === id) patches.push(child);
         }
      }

      return patches;
   }

   unpatchAll(caller) {
      const patches = this.getPatchesByCaller(caller);
      if (!patches.length) return;
      for (const patch of patches) patch.unpatch();
   }

   override(patch) {
      return function () {
         if (!patch.patches?.length) return patch.original.apply(this, arguments);

         let res;
         let args = arguments;

         for (const before of patch.patches.filter(e => e.type === 'before')) {
            try {
               const tempArgs = before.callback(this, args, patch.original.bind(this));
               if (Array.isArray(tempArgs)) args = tempArgs;
            } catch (error) {
               Logger.error(`Could not fire before patch for ${patch.func} of ${before.caller}`, error);
            }
         }

         const insteads = patch.patches.filter(e => e.type === 'instead');
         if (!insteads.length) res = patch.original.apply(this, args);

         else for (const instead of insteads) {
            try {
               const ret = instead.callback(this, args, patch.original.bind(this));
               if (typeof (ret) !== 'undefined') res = ret;
            } catch (error) {
               Logger.error(`Could not fire instead patch for ${patch.func} of ${instead.caller}`, error);
            }
         }

         for (const after of patch.patches.filter(e => e.type === 'after')) {
            try {
               const ret = after.callback(this, args, res, ret => (res = ret));
               if (typeof (ret) !== 'undefined') res = ret;
            } catch (error) {
               Logger.error(`Could not fire after patch for ${patch.func} of ${after.caller}`, error);
            }
         }

         return res;
      };
   };

   push([caller, mdl, func]) {
      const patch = {
         caller,
         mdl,
         func,
         original: mdl[func],
         unpatch: () => {
            patch.mdl[patch.func] = patch.original;
            patch.patches = [];
         },
         patches: []
      };

      mdl[func] = this.override(patch);
      Object.assign(mdl[func], patch.original, {
         toString: () => patch.original.toString(),
         '__original': patch.original
      });

      this.patches.push(patch);
      return patch;
   }

   get(caller, mdl, func) {
      const patch = this.patches.find(p => p.mdl == mdl && p.func == func);
      if (patch) return patch;

      return this.push(arguments);
   }

   patch(caller, mdl, func, callback, type = 'after') {
      if (!caller || typeof caller != 'string') {
         throw new TypeError('first argument "caller" must be of type string');
      } else if (!mdl || !['function', 'object'].includes(typeof mdl)) {
         throw new TypeError('second argument "mdl" must be of type function or object');
      } else if (!func || typeof func != 'string') {
         throw new TypeError('third argument "func" must be of type string');
      } else if (!callback || typeof callback != 'function') {
         throw new TypeError('fourth argument "callback" must be of type function');
      } else if (!type || typeof type != 'string' || !['after', 'before', 'instead'].includes(type)) {
         throw new TypeError('fifth argument "type" must be of type string and any of the three: after, before, instead');
      }

      const get = this.get(...arguments);

      const patch = {
         caller,
         type,
         id: get.patches.count,
         callback,
         unpatch: () => {
            get.patches.splice(get.patches.findIndex(p => p.id === child.id && p.type === type), 1);

            if (get.patches.length <= 0) {
               const index = this.patches.findIndex(p => p.module == module && p.func == func);
               this.patches[index].unpatch();
               this.patches.splice(index, 1);
            }
         }
      };

      get.patches.push(patch);

      return patch.unpatch;
   }

   after(caller, mdl, func, callback) {
      this.patch(caller, mdl, func, callback, 'after');
   }

   before(caller, mdl, func, callback) {
      this.patch(caller, mdl, func, callback, 'before');
   }

   instead(caller, mdl, func, callback) {
      this.patch(caller, mdl, func, callback, 'instead');
   }
};