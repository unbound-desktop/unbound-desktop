import StyleSheet from './structures/stylesheet';
import { readFileSync } from 'fs';
import Module from 'module';

interface PatchedModule extends Module {
   _extensions: Record<string, (module, filename) => any>;
}

const PatchedModule = (
   module.constructor.length > 1
      ? module.constructor
      : Module
) as any as PatchedModule;

PatchedModule._extensions['.css'] = (mdl, filename) => {
   const css = readFileSync(filename, 'utf-8');
   mdl.exports = new StyleSheet(css, filename);
};