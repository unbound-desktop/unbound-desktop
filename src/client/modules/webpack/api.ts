import Modules from '@common/data/modules';
import { common } from '@webpack';

const out: Record<keyof typeof Modules.API.items, any> = common.API;

export = out;