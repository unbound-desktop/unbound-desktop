const memoize = require('./memoize');
const getReact = memoize(() => require('@webpack/common').React);

const overrides = {
   useMemo: factory => factory(),
   useState: initialState => [initialState, () => void 0],
   useReducer: initialValue => [initialValue, () => void 0],
   useEffect: () => { },
   useLayoutEffect: () => { },
   useRef: () => ({ current: null }),
   useCallback: callback => callback
};

const keys = Object.keys(overrides);

/**
 * @name wrapInHooks
 * @description Allows you to grab a components return value by disabling its hooks when you need it outside of a render
 * @param {React.Component|Function|React.memo} component - The component to wrap
 * @return {React.Component} Returns the wrapped component's result
 */

module.exports = (component) => {
   return (...args) => {
      const React = getReact();
      const ReactDispatcher = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
      const originals = keys.map(e => [e, ReactDispatcher[e]]);

      Object.assign(ReactDispatcher, overrides);

      const res = {
         rendered: null,
         error: null
      };

      try {
         res.rendered = component(...args);
      } catch (error) {
         res.error = error;
      }

      Object.assign(ReactDispatcher, Object.fromEntries(originals));

      if (res.error) {
         throw res.error;
      }

      return res;
   };
};