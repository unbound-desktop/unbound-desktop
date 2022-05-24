const path = require('path');

exports.paths = {
   root: path.join(__dirname, '..', '..'),
   settings: path.join(__dirname, '..', '..', 'settings')
};

exports.regex = {
   newline: /\r?\n|\r/g
};

exports.contributors = [
   {
      name: 'eternal',
      id: '263689920210534400'
   }
];

exports.console = {
   success: {
      'background-color': '#6bffb2',
      'color': 'black',
      'padding': '2.5px 5px',
      'border-radius': '5px'
   },
   warn: {
      'background-color': '#fcee83',
      'color': 'black',
      'padding': '2.5px 5px',
      'border-radius': '5px'
   },
   error: {
      'background-color': '#ff0000',
      'color': 'white',
      'padding': '2.5px 5px',
      'border-radius': '5px',
      'margin-right': '2px'
   },
   log: {
      'background-color': '#990000',
      'padding': '2.5px 5px',
      'border-radius': '5px',
      'margin-right': '3px'
   }
};

exports.colors = {
   primary: '#990000'
};

exports.avatar = 'https://github.com/unbound-mod.png';

exports.entities = {
   themes: (instance, data) => {
      const isJS = typeof instance === 'function';
      if (isJS) return new instance(instance, data);

      const Theme = require('@structures/theme');
      return new Theme(instance, data);
   },
   plugins: (...args) => new args[0](...args)
};

exports.ReactSymbols = {
   Ref: Symbol.for('react.forward_ref'),
   Element: Symbol.for('react.element'),
   Memo: Symbol.for('react.memo')
};

exports.IPCEvents = {
   SPAWN_GIT: 'SPAWN_GIT'
};