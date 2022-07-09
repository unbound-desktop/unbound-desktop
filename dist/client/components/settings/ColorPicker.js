"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),Object.defineProperty(exports,"default",{enumerable:!0,get:()=>l});const a=require("../../../common/utilities/index"),b=require("../../../common/logger"),c=require("@webpack"),d=require("../../modules/webpack/common"),e=i(require("react")),f=i(require("./SettingsItem")),g=i(require("../AsyncComponent")),h=i(require("../../styles/components/colorpicker.css"));function i(a){return a&&a.__esModule?a:{default:a}}h.default.append();const j=(0,b.createLogger)("Components","ColorPicker"),k=(0,a.memoize)(async()=>{try{let b=(0,c.findByDisplayName)("GuildSettingsRolesEditDisplay");if(!b)throw"GuildSettingsRolesEditDisplay was not found!";let d=(0,a.forceRender)(()=>new b({guild:{id:""},role:{id:""}}))(),e=(0,a.findInReactTree)(d,a=>a.type?.displayName==="ColorPickerFormItem"),f=e.type({role:{id:""}}),g=(0,a.findInReactTree)(f,a=>a.props?.defaultColor).type,h=await g().props.children.type,i=await (h._ctor??h._payload._result)();return i.default}catch(k){return j.error("Failed to get ColorPicker component!",k),()=>null}});class l extends e.default.PureComponent{render(){let{className:b,title:c,description:h,required:i,default:j,defaultColors:l=d.Constants.ROLE_COLORS,...m}=this.props,n=this.props.children;delete this.props.children;let o=g.default.from(k);return e.default.createElement(f.default,Object.assign({title:c,description:h,required:i},m),e.default.createElement(o,Object.assign({colors:l,defaultColor:"number"==typeof j?j:d.Constants.DEFAULT_ROLE_COLOR,className:(0,a.classnames)("unbound-settings-color-picker",b)},this.props)),n)}}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnQvY29tcG9uZW50cy9zZXR0aW5ncy9Db2xvclBpY2tlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmluZEluUmVhY3RUcmVlLCBmb3JjZVJlbmRlciwgY2xhc3NuYW1lcywgbWVtb2l6ZSB9IGZyb20gJ0B1dGlsaXRpZXMnO1xyXG5pbXBvcnQgeyBjcmVhdGVMb2dnZXIgfSBmcm9tICdAY29tbW9uL2xvZ2dlcic7XHJcbmltcG9ydCB7IGZpbmRCeURpc3BsYXlOYW1lIH0gZnJvbSAnQHdlYnBhY2snO1xyXG5pbXBvcnQgeyBDb25zdGFudHMgfSBmcm9tICdAd2VicGFjay9jb21tb24nO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5cclxuaW1wb3J0IFNldHRpbmdzSXRlbSwgeyBTZXR0aW5nc0l0ZW1Qcm9wcyB9IGZyb20gJy4vU2V0dGluZ3NJdGVtJztcclxuaW1wb3J0IEFzeW5jQ29tcG9uZW50IGZyb20gJy4uL0FzeW5jQ29tcG9uZW50JztcclxuXHJcbmltcG9ydCBTdHlsZXMgZnJvbSAnQHN0eWxlcy9jb21wb25lbnRzL2NvbG9ycGlja2VyLmNzcyc7XHJcblN0eWxlcy5hcHBlbmQoKTtcclxuXHJcbmNvbnN0IExvZ2dlciA9IGNyZWF0ZUxvZ2dlcignQ29tcG9uZW50cycsICdDb2xvclBpY2tlcicpO1xyXG5cclxuY29uc3QgZ2V0UGlja2VyID0gbWVtb2l6ZShhc3luYyAoKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IEd1aWxkU2V0dGluZ3NSb2xlc0VkaXREaXNwbGF5ID0gZmluZEJ5RGlzcGxheU5hbWUoJ0d1aWxkU2V0dGluZ3NSb2xlc0VkaXREaXNwbGF5Jyk7XHJcbiAgICBpZiAoIUd1aWxkU2V0dGluZ3NSb2xlc0VkaXREaXNwbGF5KSB7XHJcbiAgICAgIHRocm93ICdHdWlsZFNldHRpbmdzUm9sZXNFZGl0RGlzcGxheSB3YXMgbm90IGZvdW5kISc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQ29udGVudCA9IGZvcmNlUmVuZGVyKCgpID0+IG5ldyBHdWlsZFNldHRpbmdzUm9sZXNFZGl0RGlzcGxheSh7IGd1aWxkOiB7IGlkOiAnJyB9LCByb2xlOiB7IGlkOiAnJyB9IH0pKSgpO1xyXG4gICAgY29uc3QgQ29sb3JQaWNrZXJGb3JtSXRlbSA9IGZpbmRJblJlYWN0VHJlZShDb250ZW50LCByID0+IHIudHlwZT8uZGlzcGxheU5hbWUgPT09ICdDb2xvclBpY2tlckZvcm1JdGVtJyk7XHJcbiAgICBjb25zdCBDb2xvclBpY2tlciA9IENvbG9yUGlja2VyRm9ybUl0ZW0udHlwZSh7IHJvbGU6IHsgaWQ6ICcnIH0gfSk7XHJcblxyXG4gICAgY29uc3QgbG9hZGVyID0gZmluZEluUmVhY3RUcmVlKENvbG9yUGlja2VyLCByID0+IHIucHJvcHM/LmRlZmF1bHRDb2xvcikudHlwZTtcclxuICAgIGNvbnN0IGxhenkgPSBhd2FpdCBsb2FkZXIoKS5wcm9wcy5jaGlsZHJlbi50eXBlO1xyXG4gICAgY29uc3QgbWRsID0gYXdhaXQgKGxhenkuX2N0b3IgPz8gbGF6eS5fcGF5bG9hZC5fcmVzdWx0KSgpO1xyXG5cclxuICAgIHJldHVybiBtZGwuZGVmYXVsdCBhcyBGbjtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgTG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gZ2V0IENvbG9yUGlja2VyIGNvbXBvbmVudCEnLCBlcnJvcik7XHJcbiAgICByZXR1cm4gKCkgPT4gbnVsbDtcclxuICB9XHJcbn0pO1xyXG5cclxuaW50ZXJmYWNlIENvbG9yUGlja2VyUHJvcHMgZXh0ZW5kcyBTZXR0aW5nc0l0ZW1Qcm9wcyB7XHJcbiAgZGVmYXVsdD86IG51bWJlcjtcclxuICBkZWZhdWx0Q29sb3JzPzogbnVtYmVyW107XHJcbiAgW2tleTogc3RyaW5nXTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2xvclBpY2tlciBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8Q29sb3JQaWNrZXJQcm9wcz4ge1xyXG4gIHJlbmRlcigpIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgY2xhc3NOYW1lLFxyXG4gICAgICB0aXRsZSxcclxuICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgIHJlcXVpcmVkLFxyXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXHJcbiAgICAgIGRlZmF1bHRDb2xvcnMgPSBDb25zdGFudHMuUk9MRV9DT0xPUlMsXHJcbiAgICAgIC4uLnJlc3RcclxuICAgIH0gPSB0aGlzLnByb3BzO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5wcm9wcy5jaGlsZHJlbjtcclxuXHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBkZWxldGUgdGhpcy5wcm9wcy5jaGlsZHJlbjtcclxuXHJcbiAgICBjb25zdCBQaWNrZXIgPSBBc3luY0NvbXBvbmVudC5mcm9tKGdldFBpY2tlcik7XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgPFNldHRpbmdzSXRlbVxyXG4gICAgICAgIHRpdGxlPXt0aXRsZX1cclxuICAgICAgICBkZXNjcmlwdGlvbj17ZGVzY3JpcHRpb259XHJcbiAgICAgICAgcmVxdWlyZWQ9e3JlcXVpcmVkfVxyXG4gICAgICAgIHsuLi5yZXN0fVxyXG4gICAgICA+XHJcbiAgICAgICAgPFBpY2tlclxyXG4gICAgICAgICAgY29sb3JzPXtkZWZhdWx0Q29sb3JzfVxyXG4gICAgICAgICAgZGVmYXVsdENvbG9yPXt0eXBlb2YgZGVmYXVsdFZhbHVlID09PSAnbnVtYmVyJyA/IGRlZmF1bHRWYWx1ZSA6IENvbnN0YW50cy5ERUZBVUxUX1JPTEVfQ09MT1J9XHJcbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoJ3VuYm91bmQtc2V0dGluZ3MtY29sb3ItcGlja2VyJywgY2xhc3NOYW1lKX1cclxuICAgICAgICAgIHsuLi50aGlzLnByb3BzfVxyXG4gICAgICAgIC8+XHJcbiAgICAgICAge2NoaWxkcmVuIGFzIEpTWC5FbGVtZW50fVxyXG4gICAgICA8L1NldHRpbmdzSXRlbT5cclxuICAgICk7XHJcbiAgfVxyXG59OyJdLCJuYW1lcyI6WyJDb2xvclBpY2tlciIsIlN0eWxlcyIsImFwcGVuZCIsIkxvZ2dlciIsImNyZWF0ZUxvZ2dlciIsImdldFBpY2tlciIsIm1lbW9pemUiLCJHdWlsZFNldHRpbmdzUm9sZXNFZGl0RGlzcGxheSIsImZpbmRCeURpc3BsYXlOYW1lIiwiQ29udGVudCIsImZvcmNlUmVuZGVyIiwiZ3VpbGQiLCJpZCIsInJvbGUiLCJDb2xvclBpY2tlckZvcm1JdGVtIiwiZmluZEluUmVhY3RUcmVlIiwiciIsInR5cGUiLCJkaXNwbGF5TmFtZSIsImxvYWRlciIsInByb3BzIiwiZGVmYXVsdENvbG9yIiwibGF6eSIsImNoaWxkcmVuIiwibWRsIiwiX2N0b3IiLCJfcGF5bG9hZCIsIl9yZXN1bHQiLCJkZWZhdWx0IiwiZXJyb3IiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJyZW5kZXIiLCJjbGFzc05hbWUiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwicmVxdWlyZWQiLCJkZWZhdWx0VmFsdWUiLCJkZWZhdWx0Q29sb3JzIiwiQ29uc3RhbnRzIiwiUk9MRV9DT0xPUlMiLCJyZXN0IiwiUGlja2VyIiwiQXN5bmNDb21wb25lbnQiLCJmcm9tIiwiU2V0dGluZ3NJdGVtIiwiY29sb3JzIiwiREVGQVVMVF9ST0xFX0NPTE9SIiwiY2xhc3NuYW1lcyJdLCJtYXBwaW5ncyI6IkFBQUEsbUlBMENxQkEsQ0FBVyxtQkExQ2tDLGlDQUFZLFlBQ2pELHdCQUFnQixZQUNYLFVBQVUsWUFDbEIsOEJBQWlCLGNBQ3pCLE9BQU8sZUFFdUIsZ0JBQWdCLGVBQ3JDLG1CQUFtQixlQUUzQix5Q0FBb0Msc0RBQ3ZEQyxDQUFNLFFBQUEsQ0FBQ0MsTUFBTSxFQUFFLEFBRWYsT0FBTUMsQ0FBTSxDQUFHQyxHQUFBQSxDQUFZLGFBQUEsRUFBQyxZQUFZLENBQUUsYUFBYSxDQUFDLENBRWxEQyxDQUFTLENBQUdDLEdB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