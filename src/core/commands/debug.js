const { Messages } = require('@webpack/api');
const { capitalize } = require('@utilities');
const Commands = require('@api/commands');
const { paths } = require('@constants');
const Git = require('@modules/git');

module.exports = class Command {
   constructor(client) {
      this.client = client;
   };

   register() {
      Commands.register({
         command: 'debug',
         description: 'Prints out debug information for easy problem solving.',
         execute: async (_, { channel }) => {
            const data = {
               commit: null,
               branch: null,
               url: null
            };

            try {
               if (!Git.isRepo(paths.root)) throw 'Nope.';
               const branch = await Git.getBranch(paths.root);
               const commit = await Git.getCommit(paths.root, branch);
               const url = await Git.getURL(paths.root);

               data.branch = branch;
               data.commit = commit;
               data.url = url;
            } catch {
               data.branch = 'N/A';
               data.commit = 'N/A';
               data.url = 'N/A';
            }

            switch (GLOBAL_ENV.RELEASE_CHANNEL) {
               case 'stable':
                  data.channel = 'Stable';
                  break;
               case 'ptb':
                  data.channel = 'PTB';
                  break;
               case 'canary':
                  data.channel = 'Canary';
                  break;
               case 'development':
                  data.channel = 'Development';
                  break;
            }

            const managers = Object.keys(this.client.managers);
            Messages.sendMessage(channel.id, {
               content: [
                  '**Unbound Debug Info**',
                  '',
                  `>>> » **Branch**: ${data.branch}`,
                  `» **Commit**: ${data.commit.short}`,
                  `» **Managers**: ${managers.map(capitalize).join(', ')}`,
                  `» **Release**: ${data.channel} - ${DiscordNative.app.getVersion()}`,
                  `» **Memory Usage**: ${Math.round(DiscordNative.processUtils.getCurrentMemoryUsageKB() / 1000)}MB`,
                  `» **OS**: ${process.platform} ${DiscordNative.os.arch} (${DiscordNative.os.release})`,
               ].join('\n'),
               validNonShortcutEmojis: []
            });
         }
      });
   }

   remove() {
      Commands.unregister('debug');
   }
};