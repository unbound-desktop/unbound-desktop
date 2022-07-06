import { createLogger } from '@common/logger';
import { makeStore } from '@api/settings';
import { create } from '@patcher';
import Base from './base';

class Plugin extends Base {
  public settings: ReturnType<typeof makeStore>;
  public patcher: ReturnType<typeof create>;

  constructor() {
    super();

    this.logger = createLogger('Plugin', this.data.name);
    this.patcher = create(this.data.id);
    this.settings = makeStore(this.data.id);
  }
}

export = Plugin;
