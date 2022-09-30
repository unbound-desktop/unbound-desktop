import { findByProps } from '@webpack';

export = findByProps('render', 'hydrate') as typeof import('react-dom-types');