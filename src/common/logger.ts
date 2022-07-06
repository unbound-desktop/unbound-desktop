import { parseStyleObject } from '@utilities';
import { LoggerStyles } from '@constants';

class Logger {
  tags: ['Unbound', ...string[]];
  styles = {} as typeof LoggerStyles;

  constructor(...name: string[]) {
    this.tags = ['Unbound', ...name];

    // Build logger tags
    for (let i = 0, entries = Object.entries(LoggerStyles); i < entries.length; i++) {
      const [type, css] = entries[i];
      if (type === 'default') continue;

      const style = { ...LoggerStyles.default, ...css };
      const styles = [];

      for (let i = 0; i < this.tags.length; i++) {
        if (i === this.tags.length - 1) {
          delete style['margin-right'];
        }

        styles.push(parseStyleObject(style as Record<string, any>));
      }

      this.styles[type] = [
        this.tags.map(n => `%c${n}`).join(''),
        ...styles
      ];
    }
  }

  #log(type: string = 'log', args: any[]): void {
    const style = this.styles[type] ?? this.styles.log;
    const method = console[type] ? type : 'log';

    return console[method](...style, ...args);
  }

  log(...args: any[]) {
    return this.#log('log', args);
  }

  success(...args: any[]) {
    return this.#log('success', args);
  }

  error(...args: any[]) {
    return this.#log('error', args);
  }

  warn(...args: any[]) {
    return this.#log('warn', args);
  }

  debug(...args: any[]) {
    return this.#log('debug', args);
  }

  static createLogger(...args: string[]) {
    return new Logger(...args);
  }
};

// esModuleInterop workaround
const logger = Logger;
export = logger;