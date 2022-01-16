exports.consoleStyles = {
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

exports.avatar = 'https://cdn.discordapp.com/icons/887015827134632057/3008ebb24c7217aa7dccee05603b2935.png?size=128&quality=lossless';

exports.entities = {
   'themes': (...args) => new (require('@structures/theme'))(...args),
   'plugins': (...args) => new (require('@structures/plugin'))(...args)
};