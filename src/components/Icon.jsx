const { getModules } = require('@webpack');
const { React } = require('@webpack/common');

const icons = getModules(m => ~m?.toString?.()?.indexOf?.('"currentColor"'));

module.exports = class Icon extends React.Component {
   render() {
      if (!this.props.name) return null;

      const Icon = icons.find(m => m.displayName === this.props.name);
      delete this.props.name;

      return <Icon {...this.props} />;
   }

   static get Names() {
      return icons.map(m => m.displayName);
   }
};