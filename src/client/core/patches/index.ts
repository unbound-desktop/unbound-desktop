import { createLogger } from '@common/logger';
import * as Patches from './registry';

const Logger = createLogger('Patches');

export const started: Record<string, boolean> = {};

export async function initialize() {
  const patches = Object.entries(Patches);

  for (let i = 0; i < patches.length; i++) {
    const [name, patch] = patches[i];
    if (started[name]) continue;

    try {
      await patch.initialize();
      started[name] = true;
    } catch (e) {
      Logger.error(`Failed to initialize ${name}.`, e.message);
    }
  }
}

export async function shutdown() {
  const patches = Object.entries(Patches);

  for (let i = 0; i < patches.length; i++) {
    const [name, patch] = patches[i];
    if (!started[name]) continue;

    try {
      await patch.shutdown();
      delete started[name];
    } catch (e) {
      Logger.error(`Failed to initialize ${name}.`, e.message);
    }
  }
}