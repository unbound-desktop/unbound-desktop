import Modules from '@common/data/modules';
import { common } from '@webpack';

const out: Record<keyof typeof Modules.Stores.items, any> = common.Stores;

export = out;