const { capitalize } = require('@utilities');
const Commands = require('@api/commands');
const { paths, regex } = require('@constants');
const Git = require('@modules/git');
const Clyde = require('@api/clyde');
const path = require('path');
const fs = require('fs');

module.exports = class Command {
   constructor(client) {
      this.client = client;
   };

   register() {
      for (const manager in this.client.managers) {
         Commands.register({
            command: `${manager} list`,
            description: `Displays all ${manager}.`,
            execute: () => {
               const instance = this.client.managers[manager];
               const entities = [...instance.entities?.values?.() ?? []];

               const started = entities.filter(r => r.started);
               const stopped = entities.filter(r => !r.started);

               const fields = [
                  {
                     name: `**${capitalize(manager)} - Started (${started.length})**`
                  },
                  ...started.map(this.parseEntity),
                  ...Array.from(Array(started.length % 5), () => ({
                     name: '\u200B',
                     inline: true
                  })),
                  {
                     name: `**${capitalize(manager)} - Stopped (${stopped.length})**`
                  },
                  ...stopped.map(this.parseEntity),
               ];

               Clyde.send(null, {
                  embeds: [
                     {
                        type: 'rich',
                        fields,
                        color: 13058128
                     }
                  ]
               });
            }
         });

         Commands.register({
            command: `${manager} install`,
            description: `Installs ${manager}.`,
            options: [
               {
                  type: 3,
                  name: 'url',
                  required: true,
                  description: 'The URL of the plugin to install.'
               }
            ],
            execute: async ([{ value }]) => {
               const instance = this.client.managers[manager];
               const isValid = regex.url.test(value);

               if (!isValid) {
                  return Clyde.reply(null, {
                     content: 'Please provide a valid URL'
                  });
               }

               const folder = path.resolve(paths.root, manager);
               if (!folder) fs.mkdirSync(folder);

               try {
                  await Git.clone(folder, decodeURIComponent(value));

                  const name = value.substring(value.lastIndexOf('/') + 1);

                  if (instance.remount) {
                     instance.remount(name);
                  } else if (instance.reload) {
                     instance.reload(name);
                  }

                  return Clyde.send(null, {
                     content: `Successfully installed.`
                  });
               } catch {
                  return Clyde.send(null, {
                     content: 'Failed to install, is the URL a valid git repository?'
                  });
               }
            }
         });

         if (this.client.managers[manager]?.delete) {
            const _this = this;

            Commands.register({
               command: `${manager} uninstall`,
               description: `Uninstalls ${manager}.`,
               options: [
                  {
                     type: 3,
                     name: 'name',
                     required: true,
                     description: 'The name, ID or folder of the plugin to uninstall.',
                     get choices() {
                        const instance = _this.client.managers[manager];
                        const entities = [...instance.entities?.values?.() ?? []];

                        return entities.map(r => ({
                           name: r.data?.name ?? r.name,
                           displayName: r.data?.name ?? r.name,
                           value: r.id
                        }));
                     }
                  },
               ],
               execute: async ([{ value }]) => {
                  const instance = this.client.managers[manager];

                  const data = instance.delete?.(value);

                  Clyde.send(null, { content: data.message });
               }
            });
         }
      }
   }

   parseEntity(entity) {
      const { data } = entity;

      const value = [];

      value.push(`» Version: ${data?.version ?? '1.0.0'}`);
      const authors = data?.author || data?.authors;
      if (authors) {
         const res = [];

         if (typeof authors === 'string') {
            res.push(authors);
         } else if (Array.isArray(authors)) {
            for (const author of authors) {
               res.push(author.name ?? author);
            }
         } else if (typeof authors === 'object') {
            res.push(authors.name);
         }

         value.push(`» Author(s): ${res}`);
      }

      return ({
         name: data?.name ?? entity.name,
         value: value.filter(Boolean).join('\n'),
         inline: true
      });
   }

   remove() {
      for (const manager in this.client.managers) {
         Commands.unregister(`${manager} list`);
      }
   }
};