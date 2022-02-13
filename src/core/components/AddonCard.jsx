const { Text, FormText, RelativeTooltip, Switch, Markdown, Anchor } = require('@components');
const { bulk, filters: { byProps } } = require('@webpack');
const { capitalize, classnames } = require('@utilities');
const { React } = require('@webpack/common');
const { Plug, Bd } = require('./icons');

const [
   DMs,
   Layers
] = bulk(
   byProps('openPrivateChannel'),
   byProps('popLayer')
);

module.exports = class AddonCard extends React.Component {
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

      manager?.off?.('toggle', this.onToggle.bind(this));
   }

   render() {
      const { entity } = this.props;

      const name = (
         entity.instance?._config?.info?.name ??
         entity.manifest?.name ??
         entity.displayName ??
         entity.data?.name ??
         entity.name ??
         'No name provided.'
      );

      const description = (
         entity.instance?._config?.info?.description ??
         entity.manifest?.description ??
         entity.data?.description ??
         entity.description ??
         'No description provided.'
      );

      const author = (
         entity.instance?._config?.info?.authors ??
         entity.manifest?.author ??
         entity.getAuthor?.() ??
         entity.data?.author ??
         entity.author ??
         'No author provided.'
      );

      const color = (
         entity?.color ??
         entity?.instance?.color ??
         '#3a71c1'
      );

      const version = (
         entity.instance?._config?.info?.version ??
         entity.getVersion?.() ??
         entity.data?.version ??
         entity.version ??
         'No version provided.'
      );

      return (
         <div
            className='unbound-addon-card'
            style={{ '--entity-color': color }}
         >
            <div className='unbound-addon-header'>
               <Text
                  className='unbound-addon-name'
                  size={Text.Sizes.SIZE_16}
               >
                  {name}
               </Text>
               <Text
                  className='unbound-addon-version'
                  size={Text.Sizes.SIZE_16}
                  color={Text.Colors.MUTED}
               >
                  {version}
               </Text>
               <Text
                  className='unbound-addon-authors'
                  size={Text.Sizes.SIZE_16}
                  color={Text.Colors.MUTED}
               >
                  by {this.renderAuthors(author)}
               </Text>
               <div className='unbound-addon-controls'>
                  <Switch
                     checked={this.isEnabled}
                     onChange={(v) => this.toggle(v)}
                     className='unbound-addon-switch'
                  />
               </div>
            </div>
            <div className='unbound-addon-footer'>
               <FormText
                  className={classnames(
                     'unbound-addon-description',
                     this.props.type != 'unbound' &&
                     'unbound-addon-description-has-icon'
                  )}
               >
                  <Markdown>
                     {description}
                  </Markdown>
               </FormText>
               <RelativeTooltip
                  text={`${capitalize(this.props.type)} Addon`}
                  hideOnClick={false}
               >
                  {p => this.renderType({ ...p })}
               </RelativeTooltip>
            </div>
         </div>
      );
   }

   renderAuthors(authors) {
      const res = [];

      const handleAuthor = (author) => {
         if (typeof author === 'string') {
            res.push(author);
         } else if (typeof author === 'object' && author.name) {
            const id = typeof author.id || typeof author.discord_id;
            const hasId = id && (['number', 'string'].includes(id));

            res.push(hasId ?
               <Anchor
                  className='unbound-addon-author'
                  onClick={() => {
                     Layers?.popLayer?.();
                     DMs?.openPrivateChannel?.([author.id ?? author.discord_id]);
                  }}
               >
                  {author.name}
               </Anchor> :
               author.name
            );
         }
      };

      if (Array.isArray(authors)) {
         authors.map(handleAuthor);
      } else if (typeof authors === 'object' && authors.name) {
         handleAuthor(authors);
      } else if (typeof authors === 'string') {
         res.push(authors);
      }

      return res.map((author, index) => {
         const isLast = index + 1 === res.length;

         if (typeof author == 'string') {
            return isLast ? author : `${author}, `;
         } else {
            return [author, isLast ? '' : ', '];
         }
      });
   }

   renderType(props) {
      props.className ??= 'unbound-addon-type-icon';
      props.width ??= 16;
      props.height ??= 16;

      switch (this.props.type.toLowerCase()) {
         case 'betterdiscord':
            return <Bd {...props} />;
         case 'powercord':
            return <Plug {...props} />;
         default:
            return null;
      }
   }

   get isEnabled() {
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
      switch (this.props.type.toLowerCase()) {
         case 'powercord':
            return manager == 'plugins' ? 'pluginManager' : 'styleManager';
         case 'betterdiscord':
            return manager == 'plugins' ? 'Plugins' : 'Themes';
         case 'unbound':
            return manager == 'plugins' ? 'plugins' : 'themes';
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
};