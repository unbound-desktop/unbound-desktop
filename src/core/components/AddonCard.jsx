const { Text, FormText, RelativeTooltip, Switch, Markdown } = require('@components');
const { React } = require('@webpack/common');
const { capitalize } = require('@utilities');
const { Plug, Bd } = require('./icons');

module.exports = class extends React.PureComponent {
   constructor(props) {
      super(props);

      this.client = this.props.entity.type;
   }

   renderType(props) {
      props.className ??= 'unbound-addon-type-icon';
      props.width ??= 16;
      props.height ??= 16;

      switch (this.client.toLowerCase()) {
         case 'betterdiscord':
            return <Bd {...props} />;
         case 'powercord':
            return <Plug {...props} />;
         default:
            return null;
      }
   }

   isEnabled() {
      let type;
      switch (this.client.toLowerCase()) {
         case 'powercord':
            type = this.props.type == 'plugins' ? 'pluginManager' : 'styleManager';
            return powercord[type].isEnabled(this.props.entity.entityID);
         case 'betterdiscord':
            type = this.props.type == 'plugins' ? 'Plugins' : 'Themes';
            return BdApi[type].isEnabled(this.props.entity.name);
         case 'unbound':
            type = this.props.type == 'plugins' ? 'plugins' : 'themes';
            return unbound.managers[type].isEnabled(this.props.entity.id);
      }
   }

   toggle() {
      let type;
      switch (this.client.toLowerCase()) {
         case 'powercord':
            type = this.props.type == 'plugins' ? 'pluginManager' : 'styleManager';
            powercord[type].toggle(this.props.entity.entityID);
         case 'betterdiscord':
            type = this.props.type == 'plugins' ? 'Plugins' : 'Themes';
            BdApi[type].toggle(this.props.entity.name);
         case 'unbound':
            type = this.props.type == 'plugins' ? 'plugins' : 'themes';
            unbound.managers[type].toggle(this.props.entity.id);
      }
   }

   componentWillMount() {
      let type;
      switch (this.client.toLowerCase()) {
         case 'powercord':
            type = this.props.type == 'plugins' ? 'pluginManager' : 'styleManager';
            powercord[type].on('toggle', this.onToggle.bind(this));
         case 'betterdiscord':
            type = this.props.type == 'plugins' ? 'Plugins' : 'Themes';
            BdApi[type].on('toggled', this.onToggle.bind(this));
         case 'unbound':
            unbound.managers[this.props.type].on('toggle', this.onToggle.bind(this));
      }
   }

   getType() {
      switch (this.client.toLowerCase()) {
         case 'powercord':
            return this.props.type == 'plugins' ? 'pluginManager' : 'styleManager';
         case 'betterdiscord':
            return this.props.type == 'plugins' ? 'Plugins' : 'Themes';
         case 'unbound':
            return this.props.type == 'plugins' ? 'plugins' : 'themes';
      }
   }

   getGlobal() {
      switch (this.props.type.toLowerCase()) {
         case 'powercord':
            return 'powercord';
         case 'betterdiscord':
            return 'BdApi';
         case 'unbound':
            return 'unbound';
      }
   }

   componentWillUnmount() {
      let type;
      switch (this.client.toLowerCase()) {
         case 'powercord':
            type = this.props.type == 'plugins' ? 'pluginManager' : 'styleManager';
            powercord[type].off('toggle', this.onToggle.bind(this));
         case 'betterdiscord':
            type = this.props.type == 'plugins' ? 'Plugins' : 'Themes';
            BdApi[type].off('toggled', this.onToggle.bind(this));
         case 'unbound':
            unbound.managers[this.props.type].off('toggle', this.onToggle.bind(this));
      }
   }

   onToggle(name) {
      const { entity } = this.props;
      if (![entity.id, entity.entityID, entity.name].includes(name)) {
         return;
      }

      console.log(name);
      this.forceUpdate();
   }

   render() {
      const { entity } = this.props;

      return (
         <div
            className='unbound-addon-card'
            style={{ '--entity-color': entity?.color ?? entity?.instance?.color ?? '#3a71c1' }}
         >
            <div className='unbound-addon-header'>
               <Text className='unbound-addon-name' size={Text.Sizes.SIZE_16}>
                  {entity.name ?? entity.data?.name ?? entity.displayName}
               </Text>
               <RelativeTooltip text={`${capitalize(this.client)} Addon`} hideOnClick={false}>
                  {p => this.renderType({ ...p })}
               </RelativeTooltip>
               <div className='unbound-addon-controls'>
                  <Switch
                     checked={this.isEnabled()}
                     onChange={(v) => this.toggle(v)}
                     className='unbound-addon-switch'
                  />
               </div>
            </div>
            <FormText className='unbound-addon-description'>
               <Markdown>
                  {
                     entity.manifest?.description ??
                     entity.data?.description ??
                     entity.description ??
                     'No description provided.'
                  }
               </Markdown>
            </FormText>
         </div>
      );
   }
};