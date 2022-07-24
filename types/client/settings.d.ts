/**
 * Flux Store proxy for addons.
 */
declare interface SettingsStore {
   settings: Record<string, any>;
   get: (key: string, def?: any) => any;
   set: (key: string, value: any) => void;
   toggle: (key: string, def: boolean) => void;
}