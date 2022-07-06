import { Components as ComponentType } from '@common/data/modules';
import { Components } from '@webpack/common';

const out: Record<keyof typeof ComponentType.items, any> = Components;

export = out;