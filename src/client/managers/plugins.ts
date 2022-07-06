import { createLogger } from '@common/logger';
import Base from './base';

export default class Plugins extends Base {
  logger = createLogger('Managers', 'Plugins');

  constructor() {
    super({
      name: 'Plugins',
      entity: 'Plugin',
      folder: 'plugins'
    });
  }
}