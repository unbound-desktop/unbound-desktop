import path from 'path';
import fs from 'fs';

export function get(instance, _, res) {
   const data = {};

   for (const manager in instance.managers) {
      const payload = instance.managers[manager];
      const addons = fs.readdirSync(payload.folder);

      const addonIDs = [];
      for (const addon of addons) {
         const manifest = path.resolve(payload.folder, addon, 'manifest.json');
         if (!fs.existsSync(manifest)) continue;

         try {
            const info = JSON.parse(fs.readFileSync(manifest, 'utf-8'));
            if (info.id) addonIDs.push(info.id);
         } catch { }
      }

      data[manager] = addonIDs;
   }

   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Content-Type', 'application/json');
   res.end(Buffer.from(JSON.stringify(data), 'utf-8'));
}