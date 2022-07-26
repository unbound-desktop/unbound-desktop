import { findInReactTree, getOwnerInstance } from '@utilities';
import Unbound from './structures/unbound';
import { SplashQuotes } from '@constants';
import React from 'react';

import Style from './style.css';

function init() {
   Style.append();

   const instance = new Unbound();
   instance.initialize();

   const element = document.querySelector('#splash');
   if (!element) return;

   const splash = getOwnerInstance(element, () => true, false);
   if (!splash) return;

   const Splash = splash.type;

   const oRender = Splash.prototype.render;
   Splash.prototype.render = function (...args) {
      const res = oRender.apply(this, args);

      const children = findInReactTree(res, r => r.find?.(c => c?.props?.className === 'splash-status'));
      if (children) {
         children.splice(1, 0, <span className='unbound-splash-text'>
            {SplashQuotes[SplashQuotes.length * Math.random() | 0]}
         </span>);
      }

      return res;
   };

   splash.stateNode.forceUpdate();
}

init();