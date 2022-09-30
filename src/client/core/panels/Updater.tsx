import { Button, Text, Spinner, Typography } from '@components/discord';
import { Divider, ErrorBoundary, Icon } from '@components';
import { connectComponent } from '@api/settings';
import { Locale } from '@webpack/common';
import React from 'react';

import Styles from '@styles/panels/updater.css';
import { classnames } from '@utilities';
Styles.append();

enum UpdaterStatus {
   CHECKING = 'checking',
   UPDATING = 'updating',
   IDLE = 'idle'
}

interface UpdaterProps {
   settings: SettingsStore;
}

class Updater extends React.Component<UpdaterProps> {
   render() {
      const { settings } = this.props;

      const status = settings.get('status', UpdaterStatus.IDLE);
      const disabled = settings.get('disabled', false);
      const updates = settings.get('updates', []);
      const force = settings.get('force', false);

      const data = {
         icon: 'CloudDone',
         color: 'var(--info-positive-foreground)',
         text: Locale.Messages.UNBOUND_UPDATER_DEFAULT_TEXT,
         description: Locale.Messages.UNBOUND_UPDATER_DEFAULT_DESCRIPTION
      };

      if (disabled) {
         data.text = Locale.Messages.UNBOUND_UPDATER_DISABLED_TEXT;
         data.description = Locale.Messages.UNBOUND_UPDATER_DISABLED_DESCRIPTION;
         data.color = 'var(--info-warning-foreground)';
         data.icon = 'PrivacyAndSafety';
      } else if (force) {
         data.text = Locale.Messages.UNBOUND_UPDATER_FAILED_TEXT;
         data.description = Locale.Messages.UNBOUND_UPDATER_FAILED_DESCRIPTION;
         data.color = 'var(--info-danger-foreground)';
         data.icon = 'CloseCircle';
      } else if (status === UpdaterStatus.CHECKING) {
         data.text = Locale.Messages.UNBOUND_UPDATER_FETCHING_TEXT;
         data.description = Locale.Messages.UNBOUND_UPDATER_FETCHING_DESCRIPTION;
         data.color = 'var(--header-primary)';
      } else if (status === UpdaterStatus.UPDATING) {
         data.text = Locale.Messages.UNBOUND_UPDATER_UPDATING_TEXT;
         data.description = Locale.Messages.UNBOUND_UPDATER_UPDATING_DESCRIPTION;
         data.icon = 'UpdateAvailable';
         data.color = 'var(--header-primary)';
      } else if (updates.length) {
         data.text = Locale.Messages.UNBOUND_UPDATER_NEW_UPDATES_TEXT;
         data.description = Locale.Messages.UNBOUND_UPDATER_NEW_UPDATES_DESCRIPTION;
         data.icon = 'CloudDownload';
         data.color = 'var(--header-primary)';
      }

      return <ErrorBoundary>
         <Typography
            variant='text-sm/normal'
            className={classnames(
               Typography.Classes.defaultColor,
               Typography.Classes.defaultMarginh3,
               Typography.Classes.h1
            )}
         >
            {Locale.Messages.UNBOUND_UPDATER}
         </Typography>
         <div className='unbound-updater'>
            <div className='unbound-updater-icon-container'>
               {status === UpdaterStatus.CHECKING ?
                  <Spinner
                     className='unbound-updater-checking'
                     type={Spinner.Type.SPINNING_CIRCLE}
                  /> :
                  <Icon
                     style={{ color: data.color }}
                     className='unbound-updater-icon'
                     name={data.icon}
                  />
               }
            </div>
            <div className='unbound-updater-status-container'>
               <Typography className='unbound-updater-status' tag='h3'>
                  {data.text}
               </Typography>
               <Text tag='h3'>
                  {data.description}
               </Text>
            </div>
         </div>
         <div className='unbound-updater-actions'>
            {[].length > 0 &&
               <Button
                  disabled={status === UpdaterStatus.CHECKING}
                  color={force ? Button.Colors.RED : Button.Colors.GREEN}
                  size={Button.Sizes.SMALL}
                  onClick={() => { }}
               >
                  {force ? Locale.Messages.UNBOUND_UPDATER_FORCE_UPDATES : Locale.Messages.UNBOUND_UPDATER_UPDATE_ALL}
               </Button>
            }
            <Button
               disabled={false && status === UpdaterStatus.CHECKING}
               size={Button.Sizes.SMALL}
               onClick={() => {
                  settings.set('status', UpdaterStatus.CHECKING);

                  setTimeout(() => settings.set('status', UpdaterStatus.IDLE), 2000);
               }}
            >
               {Locale.Messages.UNBOUND_UPDATER_CHECK_FOR_UPDATES}
            </Button>
            <Button
               disabled={status === UpdaterStatus.CHECKING}
               className='unbound-updater-actions-disable'
               color={disabled ? Button.Colors.GREEN : Button.Colors.RED}
               size={Button.Sizes.SMALL}
               onClick={() => settings.toggle('disabled', false)}
            >
               {disabled ? Locale.Messages.UNBOUND_UPDATER_ENABLE_UPDATES : Locale.Messages.UNBOUND_UPDATER_DISABLE_UPDATES}
            </Button>
         </div>
         <Divider />
         <div className='unbound-updater-updates-container'>
            {updates.length === 0 ?
               <div className='unbound-updater-no-updates'>
                  <img
                     className='unbound-updater-placeholder-image'
                     data-is-checking={status === UpdaterStatus.CHECKING}
                     src={disabled ? '/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg' : status !== UpdaterStatus.CHECKING ?
                        '/assets/13cb217fd14b022bf4b00dcc8c157238.svg' :
                        '/assets/8f79e7f01dbb1afeb122cb3e8c4a342f.svg'
                     }
                  />
                  <Text
                     className='unbound-updater-no-updates-title'
                     color={Text.Colors.HEADER_PRIMARY}
                     size={Text.Sizes.SIZE_20}
                  >
                     {disabled ? Locale.Messages.UNBOUND_UPDATER_UPDATES_DISABLED : status !== UpdaterStatus.CHECKING ? Locale.Messages.UNBOUND_UPDATER_UPDATES_IDLE_TITLE : Locale.Messages.UNBOUND_UPDATER_UPDATES_SEARCHING_TITLE}
                  </Text>
                  <Text
                     className='unbound-updater-no-updates-desc'
                     color={Text.Colors.HEADER_SECONDARY}
                     size={Text.Sizes.SIZE_16}
                  >
                     {disabled ? Locale.Messages.UNBOUND_UPDATER_UPDATES_DISABLED_DESC : status !== UpdaterStatus.CHECKING ? Locale.Messages.UNBOUND_UPDATER_UPDATES_IDLE_TEXT : Locale.Messages.UNBOUND_UPDATER_UPDATES_SEARCHING_TEXT}
                  </Text>
               </div>
               :
               []
               // updates.map(update => <Update settings={settings} update={update} />)
            }
         </div>
      </ErrorBoundary>;
   }
}

export default connectComponent(Updater, 'updater');