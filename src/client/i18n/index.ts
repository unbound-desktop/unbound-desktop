import { readdirSync } from 'fs';
import { basename } from 'path';

const out = {};

readdirSync(__dirname).filter(f => f !== basename(__filename) && f !== 'README.md').map(file => {
   const items = file.split('.');
   if (items.length != 1) items.splice(items.length - 1, 1);

   out[items.join('.')] = require(`${__dirname}/${file}`);
});

export = out;
