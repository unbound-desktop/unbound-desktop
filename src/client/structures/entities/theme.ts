import { createLogger } from '@common/logger';
import { makeStore } from '@api/settings';
import { create } from '@patcher';
import Base from './base';

class Theme extends Base {
  public settings: ReturnType<typeof makeStore>;
  public patcher: ReturnType<typeof create>;

  constructor() {
    super();

    this.logger = createLogger('Theme', this.data.name);
    this.patcher = create(this.data.id);
    this.settings = makeStore(this.data.id);
  }

  _stop() {
    this.patcher.unpatchAll();
    this.stop();
  }
}

export = Theme;