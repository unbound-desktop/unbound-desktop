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
   Modal: {
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
   ReactSpring: {
      props: ['useSpring']
   },
   zustand: {
      filter: m => typeof m === 'function' && m.toString().includes('[useStore, api]')
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
         Profiles: {
            storeName: 'UserProfileStore'
         },
         Messages: {
            storeName: 'MessageStore'
         },
         Games: {
            storeName: 'LocalActivityStore'
         },
         Presence: {
            storeName: 'PresenceStore'
         },
         Auth: {
            storeName: 'AuthenticationStore'
         },
         Profiles: {
            storeName: 'UserProfileStore'
         },
         Typing: {
            storeName: 'TypingStore'
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
         Spotify: {
            props: ['SpotifyAPI']
         },
         Messages: {
            props: ['sendMessage', 'receiveMessage']
         },
      }
   }
};