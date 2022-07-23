import Sheet from '@compilers/structures/stylesheet';
import { createLogger } from '@common/logger';
import { Theme } from '@entities';
import { resolve } from 'path';
import Base from './base';

export default class Themes extends Base {
  logger = createLogger('Managers', 'Themes');

  constructor() {
    super({
      name: 'Themes',
      entity: 'Theme',
      folder: 'themes'
    });
  }

  override resolvePayload(root: string, data: Record<string, any>, isSplash: boolean = false) {
    const path = resolve(root, isSplash ? data.splash : data.main ?? '');
    const payload = require(path);

    if (payload instanceof Sheet || (payload.append && payload.remove)) {
      return class extends Theme {
        start() {
          payload.append();
        }

        stop() {
          payload.remove();
        }
      };
    }

    return payload.default ?? payload;
  }
}