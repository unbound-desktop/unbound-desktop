import { createLogger } from '@common/logger';
import { Colors } from '@constants';

class Base {
  logger: ReturnType<typeof createLogger>;
  data: Record<string, any>;

  start() {

  }

  stop() {

  }

  load() {

  }

  async reload() {
    await this.stop();
    await this.start();
  }

  get color() {
    return Colors.BRAND;
  }

  get manifest() {
    return this.data;
  }
}

export = Base;
