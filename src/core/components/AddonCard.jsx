const { Text, FormText, RelativeTooltip, Switch, Markdown } = require('@components');
const { React } = require('@webpack/common');
const { capitalize } = require('@utilities');
const { Plug, Bd } = require('./icons');

module.exports = class extends React.PureComponent {
   constructor(props) {
      super(props);

      this.client = this.props.type;
   }

   componentWillMount() {
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      manager?.on?.('toggle', this.onToggle.bind(this));
   }

   componentWillUnmount() {
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      manager?.off('toggle', this.onToggle.bind(this));
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
      const name = this.props.entity.entityID ?? this.props.entity.id ?? this.props.entity.name;
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      return manager?.isEnabled?.(name);
   }

   toggle() {
      const name = this.props.entity.entityID ?? this.props.entity.id ?? this.props.entity.name;
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      return manager?.toggle?.(name);
   }

   onToggle(name) {
      const { entity } = this.props;
      if (![entity.id, entity.entityID, entity.name].includes(name)) {
         return;
      }

      this.forceUpdate();
   }

   getType() {
      const { manager } = this.props;
      switch (this.client.toLowerCase()) {
         case 'powercord':
            return manager == 'plugins' ? 'pluginManager' : 'styleManager';
         case 'betterdiscord':
            return manager == 'plugins' ? 'Plugins' : 'Themes';
         case 'unbound':
            return manager == 'plugins' ? 'plugins' : 'themes';
      }
   }

   getGlobal() {
      switch (this.client.toLowerCase()) {
         case 'powercord':
            return 'powercord';
         case 'betterdiscord':
            return 'BdApi';
         case 'unbound':
            return 'unbound';
      }
   }
};