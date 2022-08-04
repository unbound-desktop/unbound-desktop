import { readFileSync } from 'fs';
import { resolve } from 'path';

export const Paths = {
   root: resolve(__dirname, '..', '..'),
   storage: resolve(__dirname, '..', '..', '..', '..', 'unbound'),
   themes: resolve(__dirname, '..', '..', '..', '..', 'unbound', 'themes'),
   plugins: resolve(__dirname, '..', '..', '..', '..', 'unbound', 'plugins'),
   settings: resolve(__dirname, '..', '..', '..', '..', 'unbound', 'settings')
};

export enum IDs {
   BOT = '934019188450816000'
}

export const Owners = {
   // eternal#1000
   eternal: '263689920210534400'
};

export const BuildInfo = JSON.parse(readFileSync(resolve(process.resourcesPath, 'build_info.json'), 'utf-8'));

export enum IPCEvents {
   GET_WINDOW_OPTIONS = 'GET_WINDOW_OPTIONS',
   PROCESS_ISOLATED = 'PROCESS_ISOLATED'
};

export const Regex = {
   newline: /\r?\n|\r/g,
   url: /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
} as const;

export const ReactSymbols = {
   Ref: Symbol.for('react.forward_ref'),
   Element: Symbol.for('react.element'),
   Memo: Symbol.for('react.memo')
};

export const Headers = {
   delete: [
      'x-frame-options',
      'content-security-policy',
      'content-security-policy-report-only'
   ],

   append: [
      {
         name: 'access-control-allow-origin',
         value: '*',
         exists: {
            name: 'access-control-allow-credentials',
            condition: false
         }
      }
   ]
} as const;

export const Colors = {
   BRAND: '#C74050'
} as const;

export const LoggerStyles = {
   default: {
      'padding': '2.5px 5px',
      'border-radius': '5px',
      'margin-right': '3px',
      'border-bottom': '2px solid rgba(0, 0, 0, 0.5)'
   },
   success: {
      'background-color': '#6BFFB2',
      'color': 'black'
   },
   warn: {
      'background-color': '#FCEE83',
      'color': 'black'
   },
   error: {
      'background-color': '#FF0000',
      'color': 'white'
   },
   log: {
      'background-color': Colors.BRAND
   },
   debug: {
      'background-color': '#487DE9',
      'color': 'white'
   }
};