const { Icon, Text, Anchor, RelativeTooltip, Spinner, Divider } = require('@components');
const { unboundStrings: strings } = require('@api/i18n');
const { Layers } = require('@webpack/common');
const { DMs } = require('@webpack/api');
const Git = require('@modules/git');
const React = require('react');

const Unbound = require('./Icons/Unbound');
const Plugin = require('./Icons/Plugin');

class Update extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         updating: false
      };
   }

   render() {
      const { update, settings } = this.props;
      const status = { icon: null };

      switch (update.type) {
         case 'Theme':
            status.icon = <Icon name='Creative' />;
            break;
         case 'Plugin':
            status.icon = <Plugin />;
            break;
         case 'Core':
            status.icon = <Unbound />;
            break;
      }

      const force = settings.get('force', false);

      return (
         <div className='unbound-updater-update'>
            <div className='unbound-updater-update-header'>
               <Text data-update-type={update.type} className='unbound-updater-update-type-icon'>
                  {status.icon}
               </Text>
               <div>
                  <Text className='unbound-updater-update-title'>
                     {update.entity}
                  </Text>
                  <Text className='unbound-updater-update-author'>
                     {this.renderAuthors(update.authors)}
                  </Text>
               </div>
               <Text style={{ marginLeft: 'auto' }} className='unbound-updater-update-count'>
                  {update.commits.length} new update{update.commits.length > 1 && 's'}
               </Text>
               {this.state.updating
                  ?
                  <RelativeTooltip text={strings.INSTALLING} hideOnClick={false}>
                     {props => <Spinner
                        {...props}
                        className='unbound-updater-update-installing'
                        type={Spinner.Type.SPINNING_CIRCLE}
                     />}
                  </RelativeTooltip>
                  :
                  <RelativeTooltip text={force ? strings.FORCE_INSTALL : strings.INSTALL} hideOnClick={false}>
                     {props => <Icon
                        {...props}
                        data-force={Boolean(force)}
                        className='unbound-updater-update-download'
                        name='Download'
                        onClick={this.handleUpdate.bind(this)}
                     />}
                  </RelativeTooltip>}
            </div>
            <div className='unbound-updater-update-content'>
               {update.commits.map((commit, idx) =>
                  <>
                     <div className='unbound-updater-update-commit-container'>
                        <div className='unbound-updater-update-commit'>
                           <Text className='unbound-updater-update-commit-author'>{commit.author}</Text>
                           <Text>{commit.message}</Text>
                        </div>
                        <Anchor
                           className='unbound-updater-update-commit-hash'
                           onClick={() => open(`${update.url}/commit/${commit.longHash}`)}
                        >
                           {commit.short}
                        </Anchor>
                     </div>
                     {update.commits.length !== idx + 1 && <Divider />}
                  </>
               )}
            </div>
         </div>
      );
   }

   async handleUpdate() {
      const { update, settings } = this.props;

      const force = settings.get('force', []);
      const updates = settings.get('updates', []);

      this.setState({ updating: true });
      settings.set({ status: 'updating', force: false });
      const status = { force: [] };

      try {
         const needsForce = force && force.some(e => update.commits.some(u => u.longHash === e.longHash));

         await Git.pull(update.path, needsForce);

         if (needsForce) {
            console.log('fuck');
         }

         const idx = updates.indexOf(update);
         if (idx > -1) updates.splice(idx, 1);

         settings.set({ updates, force: needsForce ? false : force });
      } catch (e) {
         console.log(e);
         status.force.push(update.commits);
      }

      this.setState({ updating: false });
      if (status.force.length) {
         settings.set('force', status.force.flat());
      }

      settings.set('status', null);
   }

   renderAuthors(authors) {
      const res = [];

      const handleAuthor = (author) => {
         if (typeof author === 'string') {
            res.push(author);
         } else if (typeof author === 'object' && author.name) {
            const id = typeof author.id || typeof author.discord_id;
            const hasId = id && (['number', 'string'].includes(typeof id));

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

         if (typeof author === 'string') {
            return isLast ? author : `${author}, `;
         } else {
            return [author, isLast ? '' : ', '];
         }
      });
   }
};

module.exports = Update;