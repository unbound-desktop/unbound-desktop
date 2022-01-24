const { Text, FormText, RelativeTooltip, Switch, Markdown } = require('@components');
const { React } = require('@webpack/common');
const { capitalize } = require('@utilities');
const { Plug } = require('./icons');

module.exports = class extends React.PureComponent {
   constructor(props) {
      super(props);

      this.type = this.props.entity.type;
   }

   renderType(props) {
      props.className = 'unbound-addon-type-icon';

      switch (this.type) {
         case 'bd':
            return null;
         case 'powercord':
            return <Plug width={16} height={16} {...props} />;
         default:
            return null;
      }
   }

   get isEnabled() {
      let type;
      switch (this.type) {
         case 'powercord':
            type = this.props.type == 'plugins' ? 'pluginManager' : 'styleManager';
            return powercord[type].isEnabled(this.props.entity.entityID);
         case 'bd':
            type = this.props.type == 'plugins' ? 'Plugins' : 'Themes';
            return BdApi[type].isEnabled(this.props.entity.name);
         case 'unbound':
            type = this.props.type == 'plugins' ? 'plugins' : 'themes';
            return unbound.managers[type].isEnabled(this.props.entity.id);
      }
   }

   toggle() {
      let type;
      switch (this.type) {
         case 'powercord':
            type = this.props.type == 'plugins' ? 'pluginManager' : 'styleManager';
            powercord[type].toggle(this.props.entity.entityID);
         case 'bd':
            type = this.props.type == 'plugins' ? 'Plugins' : 'Themes';
            BdApi[type].toggle(this.props.entity.name);
         case 'unbound':
            type = this.props.type == 'plugins' ? 'plugins' : 'themes';
            unbound.managers[type].toggle(this.props.entity.id);
      }
   }

   render() {
      const { entity } = this.props;
      return (
         <div
            className='unbound-addon-card'
            style={{ '--entity-color': entity.color ?? entity.instance.color ?? '#3a71c1' }}
         >
            <div className='unbound-addon-header'>
               <Text className='unbound-addon-name' size={Text.Sizes.SIZE_16}>
                  <RelativeTooltip text={`${capitalize(this.type)} Addon`} hideOnClick={false}>
                     {p => this.renderType({ ...p })}
                  </RelativeTooltip>
                  {entity.name ?? entity.data?.name ?? entity.displayName}
               </Text>
               <div className='unbound-addon-controls'>
                  <Switch
                     checked={this.isEnabled}
                     onChange={this.toggle}
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