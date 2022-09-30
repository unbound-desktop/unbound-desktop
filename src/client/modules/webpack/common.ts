import { findByProps } from '@webpack';

export const Dispatcher = findByProps('dispatch', '_dispatch');
export const Locale = findByProps('Messages', 'getLocale');

// React
export const ReactSpring = findByProps('useSpring');

export const Layers = {
   pushLayer: (component) => Dispatcher.dispatch({ type: 'LAYER_PUSH', component }),
   popAllLayers: () => Dispatcher.dispatch({ type: 'LAYER_POP_ALL' }),
   popLayer: () => Dispatcher.dispatch({ type: 'LAYER_POP' })
};

export const MarkdownParser = findByProps('parse', 'defaultRules');