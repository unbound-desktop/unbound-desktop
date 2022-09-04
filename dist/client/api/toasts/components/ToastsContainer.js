"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),Object.defineProperty(exports,"default",{enumerable:!0,get:()=>e});const a=require("../../settings"),b=_interopRequireDefault(require("./Toast")),c=require("../../../../common/utilities/index"),d=_interopRequireDefault(require("react"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}class ToastsContainer extends d.default.PureComponent{componentDidMount(){let{manager:a}=this.props;a.on("change",this.handleChange)}componentWillUnmount(){let{manager:a}=this.props;a.off("change",this.handleChange)}handleChange(){this.forceUpdate()}render(){let{toasts:a,settings:c,manager:e}=this.props,f=c.get("toasts.position","bottom-right");if("disabled"===f)return null;let g=Object.values(a.storage).sort((a,b)=>a.time-b.time);return d.default.createElement("div",{className:"unbound-toasts-container","data-position":f},(~f.indexOf("top")?g.reverse():g).map(g=>d.default.createElement(b.default,Object.assign({},g,{key:g.id,settings:c,manager:e,store:a,position:f}))))}}!function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g}([c.bind],ToastsContainer.prototype,"handleChange",null);const e=(0,a.connectComponent)(ToastsContainer,"unbound",({key:a})=>a.startsWith("toasts."))