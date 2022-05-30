const patterns = require('./patterns');
const path = require('path');
const fs = require('fs');

class Nullbyte {
   constructor(nullbyte) {
      this.nullbyte = nullbyte;
      this.process = null;
   }

   log(...args) {
      return console.log('\x1b[31m%s\x1b[0m', 'nullbyte', '~', ...args);
   }

   attachProcess(pid) {
      try {
         this.log(`reading discord process memory`);
         this.process = this.nullbyte.openProcess(pid);
         this.log(`discord process attached with proccess handle ${this.process.handle}`);
      } catch (e) {
         this.log(`FUCK - ${e.message}.`);
      }
   }

   getAdresses(module, patterns) {
      const res = {};
      this.log(`scanning with ${patterns.length} patterns.`);

      for (const pattern of patterns) {
         try {
            const found = this.nullbyte.findPattern(this.process.handle, module, pattern, 0, 0);
            if (found) res[pattern] = found;
         } catch (e) {
            this.log('pattern search failed:', e.message);
         }
      }

      return res;
   }

   spray(addreses, patterns) {
      for (const pattern of patterns) {
         const data = {
            address: addreses[pattern],
            orig: addreses[pattern],
            sprayed: 0
         };

         if (!data.address) continue;

         const segments = pattern.split(' ');
         for (let i = 0; i < segments.length; i++) {
            try {
               this.nullbyte.write(this.process.handle, ++data.address, 144, 'byte');
               data.sprayed++;
            } catch (e) {
               this.log('byte spray failed:', e.message);
            }
         }

         const beggining = `0x${data.orig.toString(16).toUpperCase().padStart(8, '0')}`;
         const end = `0x${data.address.toString(16).toUpperCase().padStart(8, '0')}`;
         const number = patterns.indexOf(pattern) + 1;

         if (data.sprayed > 0) {
            this.log(`pattern ${number}: successfully sprayed ${data.sprayed} bytes from ${beggining} to ${end}.`);
         } else {
            this.log(`pattern ${number}: couldn't spray any bytes`);
         }
      }
   }

   patch(pid, patterns) {
      this.attachProcess(pid);
      if (!this.process) return;

      const addresses = this.getAdresses(this.process.szExeFile, patterns);
      this.log(`${Object.keys(addresses).length} patterns matched, spraying nullish bytes over their addresses.`);
      this.spray(addresses, patterns);
   }
}

const instance = path.resolve(__dirname, `nullbyte-${process.platform}.node`);
if (patterns[process.platform] && fs.existsSync(instance)) {
   const binary = require(`./nullbyte-${process.platform}`);
   const nullbyte = new Nullbyte(binary);

   nullbyte.patch(process.pid, patterns[process.platform]);
}