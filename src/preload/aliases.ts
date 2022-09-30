import { join, resolve } from 'path';
import Package from '@package';
import Module from 'module';

interface PatchedModule extends Module {
   _resolveFilename: (request: string, ...args: unknown[]) => any;
   globalPaths: string[];
}

const PatchedModule = Module as any as PatchedModule;

const aliases = {};

const oResolveFilename = PatchedModule._resolveFilename;
PatchedModule._resolveFilename = function (request, parent, isMain, options) {
   if (!request) return oResolveFilename.call(this, request, parent, isMain, options);

   const entries = Object.entries<string>(aliases);
   const [name, location] = entries.find(([name]) => request === name) || entries.find(([name]) => request.startsWith(name)) || [];
   if (name && location) request = join(__dirname, '..', '..', location, request.substr(name.length));

   return oResolveFilename.call(this, request, parent, isMain, options);
};

const names = Object.keys(Package.aliases);
for (let i = 0; i < names.length; i++) {
   const name = names[i];
   const path = Package.aliases[name];

   aliases[name] = path;
}

PatchedModule.globalPaths.push(resolve(__dirname, '..', '..', 'node_modules'));