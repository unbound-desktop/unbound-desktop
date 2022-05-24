const { getModules } = require('@webpack');
const { React } = require('@webpack/common');

const blacklist = ['GuildFeedItemHidden', 'NowPlayingMemberMenuItem', 'HelpButton'];
const icons = getModules(m =>
   m.toString === Function.toString &&
   ~m.toString().indexOf('"currentColor"') &&
   !(m.displayName && ~blacklist.indexOf(m.displayName))
);

module.exports = class Icon extends React.PureComponent {
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