import { getOwnerInstance } from '@utilities';
import Unbound from './structures/unbound';
import { React } from '@webpack/common';

function init() {
   const instance = new Unbound();
   instance.initialize();

   const element = document.querySelector('#splash');
   if (!element) return;

   // window.resizeTo(1000, 1000);
   const splash = getOwnerInstance(element, () => true, false);
   if (!splash) return;

   const Splash = splash.type;

   const oRender = Splash.prototype.render;
   Splash.prototype.render = function (...args) {
      const res = oRender.apply(this, args);
      res.props.children.props.children[1].props.children.splice(1, 0, <span
         style={{ marginTop: 10 }}
      >
         eternal was here
      </span>);

      return res;
   };

   splash.stateNode.forceUpdate();
}

init();