const { readFileSync, mkdirSync, existsSync, writeFileSync } = require('fs');
const { join, basename } = require('path');
const { createHash } = require('crypto');
const { paths } = require('@constants');
const Module = require('module');

module.exports = class Compiler {
   constructor() {
      this.type = this.constructor.name.toLowerCase();

      this.old = Module._extensions[`.${this.type}`];
      Module._extensions[`.${this.type}`] = this.handleFile.bind(this);
   }

   handleFile(mdl, filename) {
      if (this.type === 'js' && !filename.includes(basename(paths.root))) {
         this.old?.(mdl, filename);
         return mdl.exports;
      }

      const hash = this.getHash(filename);

      // Check if the file is in cache.
      // If not, compile the file and cache it.
      try {
         const content = readFileSync(join(this.folder, hash));
         if (this.shouldInternallyCompile) {
            mdl._compile(content, filename);
         } else {
            mdl.exports = content;
         }
      } catch {
         const result = this.compile(mdl, filename);

         if (this.shouldInternallyCompile) {
            mdl._compile(result, filename);
         } else {
            mdl.exports = result;
         }

         const folder = join(this.folder, hash);
         this.cache(folder, result);
      }

      return mdl.exports;
   }

   cache(path, code) {
      writeFileSync(path, code);
   }

   get shouldInternallyCompile() {
      return false;
   }

   compile() { }

   getHash(path) {
      const hash = createHash('sha1');
      hash.update(readFileSync(path));

      return hash.digest('hex');
   }

   get folder() {
      const cache = join(__dirname, '..', '..', 'cache');
      if (!existsSync(cache)) mkdirSync(cache);

      const type = join(cache, this.type);
      if (!existsSync(type)) mkdirSync(type);

      return type;
   }
};