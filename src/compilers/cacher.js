const { readFileSync, mkdirSync, existsSync, writeFileSync } = require('fs');
const { join, basename } = require('path');
const { paths } = require('@constants');
const Module = require('module');

module.exports = class Compiler {
   constructor() {
      this.type = this.constructor.name.toLowerCase();

      this.old = Module._extensions[`.${this.type}`];
      Module._extensions[`.${this.type}`] = this.handleFile.bind(this);
   }

   handleFile(mdl, filename) {
      const isUnbound = filename.includes(basename(paths.root));
      const isNodeModule = ~filename.indexOf('node_modules');

      if (this.type === 'js' && (!isUnbound || isNodeModule)) {
         this.old?.(mdl, filename);
         return mdl.exports;
      }

      const { hash, content } = this.getHash(filename);

      // Check if the file is in cache.
      // If not, compile the file and cache it.
      try {
         const content = readFileSync(join(this.folder, hash), 'utf-8');
         if (this.shouldInternallyCompile) {
            mdl._compile(content, filename);
         } else {
            mdl.exports = content;
         }
      } catch {
         const result = this.compile(mdl, filename, content);

         if (this.shouldInternallyCompile) {
            mdl._compile(result, filename);
         } else {
            mdl.exports = result;
         }

         const folder = join(this.folder, hash);
         if (this.shouldCache) this.cache(folder, result);
      }

      return mdl.exports;
   }

   cache(path, code) {
      writeFileSync(path, code);
   }

   get shouldInternallyCompile() {
      return false;
   }

   get shouldCache() {
      return true;
   }

   compile() { }

   getHash(path) {
      const content = readFileSync(path, 'utf-8');
      const hash = this.hash(content);

      return {
         hash: hash.toString(),
         content: content.toString()
      };
   }

   get folder() {
      const cache = join(__dirname, '..', '..', 'cache');
      if (!existsSync(cache)) mkdirSync(cache);

      const type = join(cache, this.type);
      if (!existsSync(type)) mkdirSync(type);

      return type;
   }

   hash(content) {
      let hash = 0;

      for (let i = 0; i < content.length; i++) {
         const char = content.charCodeAt(i);
         hash = ((hash << 5) - hash) + char;
         hash = hash & hash;
      }

      return hash;
   }
};