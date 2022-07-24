import React from 'react';

class Component {
   _isMounted: boolean;
   updater: any;
   context: any;
   refs: any;

   constructor() {
      const render = this.render;
      const ComponentContainer = () => render.call(this);

      this.render = () => React.createElement(ComponentContainer);
   }

   render() {
      return null;
   }

   isMounted() {
      return !!this._isMounted;
   }

   forceUpdate(callback) {
      this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
   }

   isReactComponent() {
      return true;
   }

   replaceState(state, callback) {
      this.updater.enqueueReplaceState(this, callback, state);
   }

   setState(state, callback) {
      if (typeof state !== 'object' && typeof state !== 'function' && state != null) {
         throw 'Silly.';
      }

      this.updater.enqueueSetState(this, state, callback, 'setState');
   }
};

export = Component;