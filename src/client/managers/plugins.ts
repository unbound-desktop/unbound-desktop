import Base from './base';

export default class Plugins extends Base {
   constructor() {
      super({
         name: 'Plugins',
         entity: 'Plugin',
         folder: 'plugins'
      });
   }
}