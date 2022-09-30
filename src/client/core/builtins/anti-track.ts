import { createLogger } from '@common/logger';
import { findByProps } from '@webpack';
import { create } from '@patcher';

const Patcher = create('unbound-anti-track');
const Logger = createLogger('Anti-Track');

const [
   Metadata,
   Analytics,
   Properties,
   Reporter
] = findByProps(
   ['trackWithMetadata'],
   ['handleTrack'],
   ['encodeProperties', 'track'],
   ['submitLiveCrashReport'],
   { bulk: true }
);

export const data = {
   name: 'Anti-Track',
   id: 'tweaks.antiTrack',
   wait: false,
   default: true
};

export function initialize() {
   try {
      patchMetadata();
   } catch (e) {
      Logger.error('Failed to patch metadata', e.message);
   }

   try {
      patchAnalytics();
   } catch (e) {
      Logger.error('Failed to patch analytics', e.message);
   }

   try {
      patchProperties();
   } catch (e) {
      Logger.error('Failed to patch properties', e.message);
   }

   try {
      patchReporter();
   } catch (e) {
      Logger.error('Failed to patch crash reporter', e.message);
   }
}

export function shutdown() {
   Patcher.unpatchAll();
}

function patchMetadata(): void {
   Patcher.instead(Metadata, 'trackWithMetadata', () => { });
   Patcher.instead(Metadata, 'trackWithGroupMetadata', () => { });
   Patcher.instead(Metadata, 'trackWithGroupMetadata', () => { });
}

function patchAnalytics(): void {
   Patcher.instead(Analytics, 'handleTrack', () => { });
}

function patchProperties(): void {
   Patcher.instead(Properties, 'track', () => { });
}

function patchReporter(): void {
   Patcher.instead(Reporter, 'submitLiveCrashReport', () => { });
}