import type { ToastOptions } from './components/Toast';
import Container from './components/ToastsContainer';
import { ReactDOM } from '@webpack/common';
import { uuid } from '@utilities';
import React from 'react';

import styles from '@styles/api/toasts.css';
import EventEmitter from 'events';
styles.append();

export const events = new EventEmitter();

export const once = events.once.bind(events);
export const off = events.off.bind(events);
export const on = events.on.bind(events);

export const toasts = { storage: {} };
export const container = document.createElement('div');
container.className = 'unbound-toasts';

export function initialize(): void {
  // Dont freeze the thread :(
  setImmediate(() => {
    ReactDOM.render(<Container manager={this} toasts={toasts} />, container);
    document.body.appendChild(container);
  });
}

export function shutdown() {
  container.remove();
}

export function open(options: ToastOptions & Record<string, any>) {
  options.id ??= uuid(5);
  options.time = Date.now();

  if (toasts.storage[options.id]) {
    return open({ ...options, id: uuid(5) });
  }

  toasts.storage[options.id] = options;
  events.emit('change', options);
  events.emit('opened', options);

  return options.id;
}

export function close(id, instant = false) {
  const toast = toasts.storage[id];
  if (!toast) return;

  if (!instant) {
    toasts.storage[toast.id] = { ...toast, closing: true };
  } else {
    delete toasts.storage[toast.id];
  }

  events.emit('change', toast);
  events.emit('closed', toast);
}

export function closeAll() {
  for (const toast in toasts.storage) {
    close(toast);
  }

  events.emit('change');
  events.emit('closed-all');
}

export function clear() {
  for (const toast in toasts.storage) {
    delete toasts[toast];
  }

  events.emit('change');
  events.emit('cleared');
}