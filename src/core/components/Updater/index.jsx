const { RelativeTooltip, Button, Icon, Text, ErrorBoundary, FormTitle, Divider, Spinner } = require('@components');
const { Modals } = require('@webpack/common');
const Settings = require('@api/settings');
const { paths } = require('@constants');
const Git = require('@modules/git');
const React = require('react');

const InfoModal = require('./InfoModal');
const Update = require('./Update');

class Updater extends React.Component {
   constructor(props) {
      super(props);

      const { settings } = props;

      this.state = {
         status: null,
         force: settings.get('force', false),
         updates: settings.get('updates', [])
      };
   }

   render() {
      const { settings } = this.props;

      const status = settings.get('status', null);
      const force = settings.get('force', false);
      const updates = settings.get('updates', []);

      const data = {
         icon: 'CloudDone',
         color: 'var(--info-positive-foreground)',
         text: "You're all caught up!",
         description: "Upcoming updates will appear here when they're pushed."
      };

      if (force) {
         data.text = 'Some updates failed to install';
         data.description = 'We faced an error updating one of the addons, due to you having unstaged changes.';
         data.color = 'var(--info-danger-foreground)';
         data.icon = 'CloseCircle';
      } else if (status === 'checking') {
         data.text = 'Fetching latest updates...';
         data.description = 'Please be patient while we fetch the latest updates for your addons.';
         data.color = 'var(--header-primary)';
      } else if (status === 'updating') {
         data.text = 'Updating addons...';
         data.description = 'Please be patient while install the latest updates for your addons.';
         data.icon = 'UpdateAvailable';
         data.color = 'var(--header-primary)';
      } else if (updates.length) {
         data.text = 'You have updates!';
         data.description = 'Procceed by clicking the update button below.';
         data.icon = 'CloudDownload';
         data.color = 'var(--header-primary)';
      }

      return <ErrorBoundary>
         <FormTitle tag='h1' className='unbound-settings-title'>
            Updater
            <RelativeTooltip text='Client Information' hideOnClick={false}>
               {p => <Icon
                  {...p}
                  className='unbound-updater-client-information'
                  name='InfoFilled'
                  onClick={() => Modals.openModal(e => <InfoModal {...e} />)}
               />}
            </RelativeTooltip>
         </FormTitle>
         <div className='unbound-updater'>
            <div className='unbound-updater-icon-container'>
               {status === 'checking' ?
                  <Spinner className='unbound-updater-checking' type={Spinner.Type.SPINNING_CIRCLE} /> :
                  <Icon
                     style={{ color: data.color }}
                     className='unbound-updater-icon'
                     name={data.icon}
                  />
               }
            </div>
            <div className='unbound-updater-status-container'>
               <FormTitle className='unbound-updater-status' tag='h3'>{data.text}</FormTitle>
               <Text tag='h3'>{data.description}</Text>
            </div>
         </div>
         <div className='unbound-updater-actions'>
            {updates.length > 0 &&
               <Button
                  disabled={status}
                  color={force ? Button.Colors.RED : Button.Colors.GREEN}
                  size={Button.Sizes.SMALL}
                  onClick={this.handleInstall.bind(this)}
               >
                  {force ? 'Force updates' : 'Update All'}
               </Button>
            }
            <Button
               disabled={status}
               size={Button.Sizes.SMALL}
               onClick={this.handleUpdateCheck.bind(this)}
            >
               Check for updates
            </Button>
            <Button
               disabled={status}
               className='unbound-updater-actions-disable'
               color={Button.Colors.RED}
               size={Button.Sizes.SMALL}
               onClick={() => {

               }}
            >
               Disable updates
            </Button>
         </div>
         <Divider />
         <div className='unbound-updater-updates-container'>
            {updates.length === 0 ?
               <div className='unbound-updater-no-updates'>
                  <img
                     className='unbound-updater-placeholder-image'
                     data-is-checking={status === 'checking'}
                     src={status !== 'checking' ?
                        '/assets/13cb217fd14b022bf4b00dcc8c157238.svg' :
                        '/assets/8f79e7f01dbb1afeb122cb3e8c4a342f.svg'
                     }
                  />
                  <Text
                     className='unbound-updater-no-updates-title'
                     color={Text.Colors.HEADER_PRIMARY}
                     size={Text.Sizes.SIZE_20}
                  >
                     {status !== 'checking' ? 'Wumpus doesn\'t have any updates for you!' : 'We\'re searching for updates.'}
                  </Text>
                  <Text
                     className='unbound-updater-no-updates-desc'
                     color={Text.Colors.HEADER_SECONDARY}
                     size={Text.Sizes.SIZE_16}
                  >
                     {status !== 'checking' ? 'Feel free to lay back and relax, we will notify you when updates become available.' : 'Please be patient as we push any found updates to this area.'}
                  </Text>
               </div>
               :
               updates.map(update => <Update settings={settings} update={update} />)
            }
         </div>
      </ErrorBoundary>;
   }

   async handleInstall() {
      const { settings } = this.props;

      const force = settings.get('force', false);
      const updates = settings.get('updates', []);

      settings.set({ status: 'updating', force: false });

      const status = { force: [force ?? []] };
      await Promise.allSettled(updates.map(async update => {
         try {
            const needsForce = force && force.some(e => update.commits.some(u => u.longHash === e.longHash));

            await Git.pull(update.path, needsForce);

            if (needsForce) {
               console.log('fuck');
            } else {
               const idx = updates.indexOf(update);
               if (idx > -1) updates.splice(idx, 1);
            }

            settings.set({ updates, force: needsForce ? false : force });
         } catch (e) {
            status.force.push(update.commits);
         }
      }));

      if (status.force.length) {
         settings.set('force', status.force.flat());
      }

      settings.set('status', null);
   }

   async handleUpdateCheck() {
      const { settings } = this.props;
      settings.set({ updates: [], status: 'checking', force: false });

      const res = [];

      const Plugins = unbound?.managers?.plugins?.entities;
      const Themes = unbound?.managers?.themes?.entities;
      if (!Plugins || !Themes) {
         return settings.set('status', null);
      }

      const PCPlugins = window.powercord?.pluginManager?.addons;
      const PCThemes = window.powercord?.styleManager?.addons;

      res.push(...await this.handleEntities([...Plugins.values()], 'Plugin'));
      res.push(...await this.handleEntities([...Themes.values()], 'Theme'));
      if (PCPlugins) res.push(...await this.handleEntities(PCPlugins, 'Plugin'));
      if (PCThemes) res.push(...await this.handleEntities(PCThemes, 'Theme'));

      try {
         res.push(...await this.handleUpdates({
            path: paths.root,
            name: 'Unbound',
            authors: [{ name: 'eternal', id: '263689920210534400' }],
            type: 'Core'
         }));
      } catch { }

      return settings.set({
         updates: res.sort((a, b) => b.entity - a.entity),
         status: null
      });
   }

   async handleEntities(entities, type) {
      const res = [];

      await Promise.allSettled(entities.map(async entity => {
         try {
            const updates = await this.handleUpdates({
               path: entity.path,
               name: entity.manifest?.name ?? entity.data.name,
               authors: entity.manifest?.author ?? entity.data.author ?? entity.data.authors,
               type
            });

            res.push(...updates);
         } catch { }
      }));

      return res;
   }

   async handleUpdates({ path, name, authors, type }) {
      const updates = [];

      try {
         const isRepo = Git.isRepo(path);
         if (!isRepo) return;

         const branch = await Git.getBranch(path);
         const commits = await Git.getNewCommits(path, branch);
         const url = await Git.getURL(path);

         if (commits.length) {
            updates.push({ entity: name, authors, commits, path, type, url });
         }
      } catch { }

      return updates;
   }
};

module.exports = Settings.connectComponent(Updater, 'unbound-updater');