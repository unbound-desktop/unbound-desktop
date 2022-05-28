module.exports = {
   React: {
      props: ['createElement', 'Component'],
   },
   ReactDOM: {
      props: ['hydrate', 'findDOMNode']
   },
   Flux: {
      props: [
         ['Store', 'connectStores'],
         ['useStateFromStoresObject']
      ]
   },
   Dispatcher: {
      props: ['_dispatch', 'dirtyDispatch']
   },
   Modals: {
      props: ['openModal', 'openModalLazy']
   },
   ContextMenu: {
      props: ['openContextMenu', 'closeContextMenu']
   },
   Constants: {
      props: [
         'Endpoints',
         'API_HOST'
      ]
   },
   Locale: {
      props: [
         'Messages'
      ],
      ensure: (m) => Object.keys(m?.Messages ?? {}).length > 5
   },
   HighlightJS: {
      props: ['highlight', 'NUMBER_MODE']
   },
   Moment: {
      props: ['unix']
   },
   ReactSpring: {
      props: ['useSpring']
   },
   zustand: {
      filter: m => typeof m === 'function' && m.toString().includes('[useStore, api]')
   },
   Layers: {
      props: ['popLayer']
   },
   MarkdownParser: {
      props: ['parse', 'defaultRules']
   },
   stores: {
      submodule: true,
      items: {
         Users: {
            storeName: 'UserStore'
         },
         Channels: {
            storeName: 'ChannelStore'
         },
         Guilds: {
            storeName: 'GuildStore'
         },
         Relationships: {
            storeName: 'RelationshipStore'
         },
         Guilds: {
            storeName: 'GuildStore'
         },
         SelectedChannels: {
            storeName: 'SelectedChannelStore'
         },
         SelectedGuilds: {
            storeName: 'SelectedGuildStore'
         },
         Messages: {
            storeName: 'MessageStore'
         }
      }
   },
   API: {
      submodule: true,
      items: {
         Users: {
            props: ['getUser', 'fetchProfile']
         },
         Guilds: {
            props: ['requestMembersById']
         },
         DMs: {
            props: ['openPrivateChannel']
         },
         Messages: {
            props: ['sendMessage', 'receiveMessage']
         },
         Invites: {
            props: ['acceptInvite']
         }
      }
   },
   SettingsActions: {
      props: ['setSection', 'open']
   }
};