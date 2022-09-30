import { findByPrototypes } from '@webpack';
import { ErrorBoundary } from '@components';
import { Locale } from '@webpack/common';
import { create } from '@patcher';
import React from 'react';

import General from '@core/panels/General';
import Updater from '@core/panels/Updater';
import Plugins from '@core/panels/Plugins';
import Themes from '@core/panels/Themes';

const Patcher = create('unbound-settings');

const SettingsView = findByPrototypes('getPredicateSections');

export function initialize() {
   if (!SettingsView?.prototype?.getPredicateSections) return;

   const unpatch = Patcher.before(SettingsView.prototype, 'getPredicateSections', () => {
      if (window.PCInternals) {
         PCInternals.SettingsRenderer.filterItems = () => false;
         unpatch();
      }
   });

   Patcher.after(SettingsView.prototype, 'getPredicateSections', (_, __, res) => {
      if (!res?.length) return;

      const connections = res.findIndex(r => r.label === Locale.Messages.APP_SETTINGS);
      if (connections < 0) return;

      res.splice(connections, 0,
         {
            label: 'Unbound',
            section: 'HEADER'
         },
         {
            label: Locale.Messages.UNBOUND_GENERAL,
            section: 'Unbound',
            element: () => <ErrorBoundary>
               <General />
            </ErrorBoundary>
         },
         {
            label: Locale.Messages.UNBOUND_PLUGINS,
            section: 'Unbound Plugins',
            element: () => <ErrorBoundary>
               <Plugins />
            </ErrorBoundary>
         },
         {
            label: Locale.Messages.UNBOUND_THEMES,
            section: 'Unbound Themes',
            element: () => <ErrorBoundary>
               <Themes />
            </ErrorBoundary>
         },
         {
            label: Locale.Messages.UNBOUND_UPDATER,
            section: 'Unbound Updater',
            element: () => <ErrorBoundary>
               <Updater />
            </ErrorBoundary>
         },
         {
            section: 'DIVIDER'
         }
      );
   });
}

export function shutdown() {
   Patcher.unpatchAll();

   if (window.PCInternals) {
      PCInternals.SettingsRenderer.filterItems = () => true;
   }
}