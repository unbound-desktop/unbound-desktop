const { React } = require('@webpack/common');
const AddonCard = require('./AddonCard');

module.exports = class extends React.PureComponent {
   constructor(props) {
      super();

      this.type = props.type;
      this.entities = {
         unbound: [...unbound.managers[this.type]?.entities?.values() ?? []],
         powercord: [],
         bd: []
      };

      if (this.type == 'plugins' && window.powercord?.pluginManager) {
         this.entities.powercord.push(...[...powercord.pluginManager.addons]);
      } else if (this.type == 'themes' && window.powercord?.styleManager) {
         this.entities.powercord.push(...[...powercord.styleManager.addons]);
      }

      if (this.type == 'plugins' && window.BdApi?.Plugins) {
         this.entities.bd.push(...[...BdApi.Plugins.getAll()]);
      } else if (this.type == 'themes' && window.BdApi?.Themes) {
         this.entities.bd.push(...[...BdApi.Themes.getAll()]);
      }

      this.state = {
         search: null
      };
   }

   render() {
      const entities = Object.keys(this.entities).map(type => {
         const entities = this.entities[type];
         entities.map(e => e.type = type);

         return entities;
      }).flat();

      return entities.map(e => <AddonCard type={this.type} entity={e} />);
   }
};