import { version } from '@root/../index.json';
import { ReleaseChannels } from '@constants';

export default {
   name: 'debug',
   description: 'Sends debug information about Unbound.',
   execute: () => {
      const channel = ReleaseChannels[DiscordNative.app.getReleaseChannel()];

      return {
         send: true,
         content: [
            '**Unbound Debug Info** ',
            '',
            `>>> » **Version**: ${version}`,
            `» **Release**: ${channel} - ${DiscordNative.app.getVersion()}`,
            `» **Memory Usage**: ${Math.round(DiscordNative.processUtils.getCurrentMemoryUsageKB() / 1000)}MB`,
            `» **OS**: ${process.platform} ${DiscordNative.os.arch} (${DiscordNative.os.release})`,
         ].join('\n')
      };
   }
};