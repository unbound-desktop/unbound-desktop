"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const a=require("path"),b=_interopRequireDefault(require("../../package.json")),c=_interopRequireDefault(require("module"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}const d=module.constructor.length>1?module.constructor:c.default,e={},f=d._resolveFilename;d._resolveFilename=function(b,c,d,g){if(!b)return f.call(this,b,c,d,g);let[h,i]=Object.entries(e).find(([a])=>~b.indexOf(a))||[];return h&&i&&(b=(0,a.join)(__dirname,"..","..",i,b.substr(h.length))),f.call(this,b,c,d,g)};const g=Object.keys(b.default.aliases);for(let h=0;h<g.length;h++){let i=g[h],j=b.default.aliases[i];e[i]=j}d.globalPaths.push((0,a.resolve)(__dirname,"..","..","node_modules"))