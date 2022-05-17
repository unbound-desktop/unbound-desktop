const { RelativeTooltip, Button, Icon, Text, ErrorBoundary, FormTitle, Divider, Spinner } = require('@components');
const { unboundStrings: strings } = require('@api/i18n');
const { Modals } = require('@webpack/common');
const Settings = require('@api/settings');
const Updater = require('@core/updater');
const React = require('react');

const InfoModal = require('./InfoModal');
const Update = require('./Update');

class UpdaterPanel extends React.Component {
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

      const disabled = settings.get('disabled', false);
      const status = settings.get('status', null);
      const force = settings.get('force', false);
      const updates = settings.get('updates', []);

      const data = {
         icon: 'CloudDone',
         color: 'var(--info-positive-foreground)',
         text: strings.UPDATER_DEFAULT_TEXT,
         description: strings.UPDATER_DEFAULT_DESCRIPTION
      };

      if (disabled) {
         data.text = strings.UPDATER_DISABLED_TEXT;
         data.description = strings.UPDATER_DISABLED_DESCRIPTION;
         data.color = 'var(--info-warning-foreground)';
         data.icon = 'PrivacyAndSafety';
      } else if (force) {
         data.text = strings.UPDATER_FAILED_TEXT;
         data.description = strings.UPDATER_FAILED_DESCRIPTION;
         data.color = 'var(--info-danger-foreground)';
         data.icon = 'CloseCircle';
      } else if (status === 'checking') {
         data.text = strings.UPDATER_FETCHING_TEXT;
         data.description = strings.UPDATER_FETCHING_DESCRIPTION;
         data.color = 'var(--header-primary)';
      } else if (status === 'updating') {
         data.text = strings.UPDATER_UPDATING_TEXT;
         data.description = strings.UPDATER_UPDATING_DESCRIPTION;
         data.icon = 'UpdateAvailable';
         data.color = 'var(--header-primary)';
      } else if (updates.length) {
         data.text = strings.UPDATER_NEW_UPDATES_TEXT;
         data.description = strings.UPDATER_NEW_UPDATES_DESCRIPTION;
         data.icon = 'CloudDownload';
         data.color = 'var(--header-primary)';
      }

      return <ErrorBoundary>
         <FormTitle tag='h1' className='unbound-settings-title'>
            {strings.UPDATER}
            <RelativeTooltip text={strings.CLIENT_INFORMATION} hideOnClick={false}>
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
                  onClick={() => Updater.install()}
               >
                  {force ? strings.FORCE_UPDATES : strings.UPDATE_ALL}
               </Button>
            }
            <Button
               disabled={disabled || status}
               size={Button.Sizes.SMALL}
               onClick={() => Updater.fetch()}
            >
               {strings.CHECK_FOR_UPDATES}
            </Button>
            <Button
               disabled={status}
               className='unbound-updater-actions-disable'
               color={disabled ? Button.Colors.GREEN : Button.Colors.RED}
               size={Button.Sizes.SMALL}
               onClick={() => settings.toggle('disabled', false)}
            >
               {disabled ? strings.ENABLE_UPDATES : strings.DISABLE_UPDATES}
            </Button>
         </div>
         <Divider />
         <div className='unbound-updater-updates-container'>
            {updates.length === 0 ?
               <div className='unbound-updater-no-updates'>
                  <img
                     className='unbound-updater-placeholder-image'
                     data-is-checking={status === 'checking'}
                     src={disabled ? '/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg' : status !== 'checking' ?
                        '/assets/13cb217fd14b022bf4b00dcc8c157238.svg' :
                        '/assets/8f79e7f01dbb1afeb122cb3e8c4a342f.svg'
                     }
                  />
                  <Text
                     className='unbound-updater-no-updates-title'
                     color={Text.Colors.HEADER_PRIMARY}
                     size={Text.Sizes.SIZE_20}
                  >
                     {disabled ? strings.UPDATES_DISABLED : status !== 'checking' ? strings.UPDATES_IDLE_TITLE : strings.UPDATES_SEARCHING_TITLE}
                  </Text>
                  <Text
                     className='unbound-updater-no-updates-desc'
                     color={Text.Colors.HEADER_SECONDARY}
                     size={Text.Sizes.SIZE_16}
                  >
                     {disabled ? strings.UPDATES_DISABLED_DESC : status !== 'checking' ? strings.UPDATES_IDLE_TEXT : strings.UPDATES_SEARCHING_TEXT}
                  </Text>
               </div>
               :
               updates.map(update => <Update settings={settings} update={update} />)
            }
         </div>
      </ErrorBoundary>;
   }
};

module.exports = Settings.connectComponent(UpdaterPanel, 'unbound-updater');