/**
 * @name forceUpdateElement
 * @description Force updates a rendered React component by its DOM selector
 * @param {string} selector - The DOM selector to force update
 * @param {boolean} all - Whether all elements matching that selector should be force updated
 */

const getOwnerInstance = require('./getOwnerInstance');
const traverseType = require('./traverseType');
const Patcher = require('../patcher');
const getReactInstance = require('./getReactInstance');
const findInTree = require('./findInTree');

const Updater = {
   initialized: false,
   action: null
};

function forceUpdateElement(selector, all = false) {
   if (!Updater.initialized) {
      const { ReactDOM, React } = require('@webpack/common');
      const element = document.createElement('div');

      /*
       * Render a fake element in the React virtual DOM
       * This allows us to get ReactDOM's internal function
       * that handles state updates.
       */
      return new Promise(resolve => {
         ReactDOM.render(React.createElement(() => {
            /*
             * Prototype "pollute" the bind function to grab React's state manager.
             * Once grabbed, restore the bind function to its original state
             */

            const bind = Function.prototype.bind;
            try {
               Function.prototype.bind = function (...args) {
                  Updater.action = this;
                  return bind.call(this, args);
               };

               /*
                * Initialize a state to allow this component to have
                * a state ReactDOM's dispatcher can update.
                */
               React.useState(true);
            } finally {
               Function.prototype.bind = bind;
            }

            return null;
         }), element, () => {
            /*
             * Unmount the node and resolve our promise
             * as we grabbed what we needed, therefore
             * our fake element in the virtual DOM
             * is no longer required.
             */
            ReactDOM.unmountComponentAtNode(element);
            Updater.initialized = true;
            resolve();
         });
      }).then(() => forceUpdateElement(selector, all));
   }

   const elements = [...(all ?
      document.querySelectorAll(selector) :
      [document.querySelector(selector)]
   )];

   for (const element of elements) {
      const instance = getReactInstance(element);
      if (!instance) continue;

      const find = (tree) => {
         if (!tree || typeof tree.type === 'string') return false;
         const type = traverseType(tree.type);

         if (typeof type !== 'function') return false;
         if (tree.child && typeof tree.child.type !== 'string') {
            const childType = traverseType(tree.child.type);
            if (childType && (childType === type)) {
               return false;
            }
         }

         return true;
      };

      const fiber = findInTree(instance, find, { walkable: ['return'] }) || findInTree(instance, find, { walkable: ['child', 'sibling'] });

      console.log(fiber);
      if (!fiber.stateNode?.forceUpdate) {
         console.log('Functional component detected, proceeding to use custom forceUpdate.');

         if (typeof fiber.type === 'function') {
            fiber.type = traverseType(fiber.elementType);

            if (fiber.alternate) {
               fiber.alternate.type = traverseType(fiber.alternate.elementType);
            }
         }

         Updater.action.call(null, fiber, {
            last: null,
            lastRenderedState: {},
            lastRenderedReducer: () => true,
            pending: { next: function () { console.log(this); } }
         });
      } else {
         console.log('Class component detected, proceeding to use built-in forceUpdate.');
         fiber.stateNode.forceUpdate();
      }
   }

   return Promise.resolve();
};

module.exports = forceUpdateElement;