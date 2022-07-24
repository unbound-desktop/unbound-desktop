import type { Manifest } from '@managers/base';
import { createLogger } from '@common/logger';
import { Colors } from '@constants';

class Base {
   public logger: ReturnType<typeof createLogger>;
   public started: boolean;
   public data: Manifest;
   public folder: string;
   public path: string;
   public id: string;

   start() {

   }

   stop() {

   }

   _stop() {

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