const path = require('path');
const fs = require('fs');

module.exports = (ctx, req, res) => {
   const data = {};

   for (const manager in ctx.managers) {
      const instance = ctx.managers[manager];
      const addons = fs.readdirSync(instance.path);

      const addonIDs = [];
      for (const addon of addons) {
         const manifest = path.resolve(instance.path, addon, 'manifest.json');
         if (!fs.existsSync(manifest)) continue;

         try {
            const info = JSON.parse(fs.readFileSync(manifest));
            if (info.id) addonIDs.push(info.id);
         } catch { }
      }

      data[manager] = addonIDs;
   }

   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Content-Type', 'application/json');
   res.end(Buffer.from(JSON.stringify(data), 'utf-8'));
};