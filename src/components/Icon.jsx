const { getModules } = require('@webpack');
const { React } = require('@webpack/common');

const icons = getModules(m => typeof m == 'function' && ~m.toString().indexOf('"currentColor"'));

function Icon(props) {
   if (!props.name) return null;

   const Icon = icons.find(m => m.displayName === props.name);
   delete props.name;

   return <Icon {...props} />;
};

Icon.Names = icons.map(m => m.displayName);

module.exports = Icon;