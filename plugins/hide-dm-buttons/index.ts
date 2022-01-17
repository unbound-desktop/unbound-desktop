import { getModuleByDisplayName } from '@webpack';
import Plugin from '@structures/plugin';
import Patcher from '@patcher';

export default class HideDMButtons extends Plugin {
   start(): void {
      const DMsList: Object = getModuleByDisplayName('ConnectedPrivateChannelsList', { default: false });
      Patcher.before(this.constructor.name, DMsList, 'default', (_, args) => {
         const Arguments: any = args[0];

         if (Arguments.children) {
            Arguments.children = Arguments.children.filter(a => a?.key == 'friends');
         }

         return args;
      });
   }

   stop(): void {
      Patcher.unpatchAll(this.constructor.name);
   }
};
