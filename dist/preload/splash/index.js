"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const a=require("../../common/utilities/index"),b=function(a){return a&&a.__esModule?a:{default:a}}(require("./structures/unbound")),c=require("../../client/modules/webpack/common");!function(){let d=new b.default;d.initialize();let e=document.querySelector("#splash");if(!e)return;let f=(0,a.getOwnerInstance)(e,()=>!0,!1);if(!f)return;let g=f.type,h=g.prototype.render;g.prototype.render=function(...a){let b=h.apply(this,a);return b.props.children.props.children[1].props.children.splice(1,0,c.React.createElement("span",{style:{marginTop:10}},"eternal was here")),b},f.stateNode.forceUpdate()}()
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcmVsb2FkL3NwbGFzaC9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0T3duZXJJbnN0YW5jZSB9IGZyb20gJ0B1dGlsaXRpZXMnO1xyXG5pbXBvcnQgVW5ib3VuZCBmcm9tICcuL3N0cnVjdHVyZXMvdW5ib3VuZCc7XHJcbmltcG9ydCB7IFJlYWN0IH0gZnJvbSAnQHdlYnBhY2svY29tbW9uJztcclxuXHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgY29uc3QgaW5zdGFuY2UgPSBuZXcgVW5ib3VuZCgpO1xyXG4gIGluc3RhbmNlLmluaXRpYWxpemUoKTtcclxuXHJcbiAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzcGxhc2gnKTtcclxuICBpZiAoIWVsZW1lbnQpIHJldHVybjtcclxuXHJcbiAgLy8gd2luZG93LnJlc2l6ZVRvKDEwMDAsIDEwMDApO1xyXG4gIGNvbnN0IHNwbGFzaCA9IGdldE93bmVySW5zdGFuY2UoZWxlbWVudCwgKCkgPT4gdHJ1ZSwgZmFsc2UpO1xyXG4gIGlmICghc3BsYXNoKSByZXR1cm47XHJcblxyXG4gIGNvbnN0IFNwbGFzaCA9IHNwbGFzaC50eXBlO1xyXG5cclxuICBjb25zdCBvUmVuZGVyID0gU3BsYXNoLnByb3RvdHlwZS5yZW5kZXI7XHJcbiAgU3BsYXNoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoLi4uYXJncykge1xyXG4gICAgY29uc3QgcmVzID0gb1JlbmRlci5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIHJlcy5wcm9wcy5jaGlsZHJlbi5wcm9wcy5jaGlsZHJlblsxXS5wcm9wcy5jaGlsZHJlbi5zcGxpY2UoMSwgMCwgPHNwYW5cclxuICAgICAgc3R5bGU9e3sgbWFyZ2luVG9wOiAxMCB9fVxyXG4gICAgPlxyXG4gICAgICBldGVybmFsIHdhcyBoZXJlXHJcbiAgICA8L3NwYW4+KTtcclxuXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH07XHJcblxyXG4gIHNwbGFzaC5zdGF0ZU5vZGUuZm9yY2VVcGRhdGUoKTtcclxufVxyXG5cclxuaW5pdCgpOyJdLCJuYW1lcyI6WyJpbml0IiwiaW5zdGFuY2UiLCJVbmJvdW5kIiwiaW5pdGlhbGl6ZSIsImVsZW1lbnQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJzcGxhc2giLCJnZXRPd25lckluc3RhbmNlIiwiU3BsYXNoIiwidHlwZSIsIm9SZW5kZXIiLCJwcm90b3R5cGUiLCJyZW5kZXIiLCJhcmdzIiwicmVzIiwiYXBwbHkiLCJwcm9wcyIsImNoaWxkcmVuIiwic3BsaWNlIiwic3BhbiIsInN0eWxlIiwibWFyZ2luVG9wIiwic3RhdGVOb2RlIiwiZm9yY2VVcGRhdGUiXSwibWFwcGluZ3MiOiJBQUFBLG9GQUFpQyw4QkFBWSw4REFDekIsc0JBQXNCLGFBQ3BCLHFDQUFpQixHQThCdkNBLEFBNUJBLFVBQWdCLENBQ2QsSUFBTUMsQ0FBUSxDQUFHLElBQUlDLENBQU8sUUFBQSxBQUFFLEFBQUMsQUFDL0JELENBQUFBLENBQVEsQ0FBQ0UsVUFBVSxFQUFFLEFBRXJCLEtBQU1DLENBQU8sQ0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUMsU0FBUyxDQUFDLEFBQUMsQUFDbEQsSUFBSSxDQUFDRixDQUFPLENBQUUsTUFBTyxBQUdyQixLQUFNRyxDQUFNLENBQUdDLEdBQUFBLENBQWdCLGlCQUFBLEVBQUNKLENBQU8sQ0FBRSxJQUFNLENBQUEsQ0FBSSxDQUFFLENBQUEsQ0FBSyxDQUFDLEFBQUMsQUFDNUQsSUFBSSxDQUFDRyxDQUFNLENBQUUsTUFBTyxBQUVwQixLQUFNRSxDQUFNLENBQUdGLENBQU0sQ0FBQ0csSUFBSSxDQUVwQkMsQ0FBTyxDQUFHRixDQUFNLENBQUNHLFNBQVMsQ0FBQ0MsTUFBTSxBQUZaLEFBRzNCSixDQUFBQSxDQUFNLENBQUNHLFNBQVMsQ0FBQ0MsTUFBTSxDQUFHLFNBQVUsR0FBR0MsQ0FBSSxDQUFFLENBQzNDLElBQU1DLENBQUcsQ0FBR0osQ0FBTyxDQUFDSyxLQUFLLENBQUMsSUFBSSxDQUFFRixDQUFJLENBQUMsQUFBQyxBQU90QyxRQU5BQyxDQUFHLENBQUNFLEtBQUssQ0FBQ0MsUUFBUSxDQUFDRCxLQUFLLENBQUNDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQ0QsS0FBSyxDQUFDQyxRQUFRLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUUsQ0FBQyxDQUFFLHNCQUFDQyxNQUFJLEVBQ3BFQyxLQUFLLENBQUUsQ0FBRUMsU0FBUyxDQUFFLEVBQUUsQ0FBRSxFQUN6QixrQkFFRCxDQUFPLENBQUMsQ0FFRFAsQ0FBRyxBQUFDLENBQ1osQ0FFRFIsQ0FBTSxDQUFDZ0IsU0FBUyxDQUFDQyxXQUFXLEVBQUUsQ0FDL0IsRUFFSyxBQUFDIn0=