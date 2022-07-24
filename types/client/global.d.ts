export { };

declare global {
   interface Window {
      _: typeof import('lodash');
      DiscordNative: any;
      powercord?: any;
      BdApi?: any;
      [key: string]: any;
   }
}