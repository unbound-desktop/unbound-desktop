module.exports = {
   Messages: {
      props: [
         'sendMessage',
         'receiveMessage'
      ]
   },
   React: {
      props: [
         'createElement',
         'Component'
      ],
   },
   ReactDOM: {
      props: [
         'hydrate',
         'findDOMNode'
      ]
   },
   Flux: {
      props: [
         [
            'Store',
            'connectStores'
         ],
         [
            'useStateFromStoresObject'
         ]
      ]
   },
   Users: {
      props: [
         'getCurrentUser',
         'getUser'
      ]
   },
   AsyncUsers: {
      props: [
         'getUser',
         'fetchProfile'
      ]
   },
   Guilds: {
      props: [
         'getGuildCount'
      ]
   },
   Relationships: {
      props: [
         'getNickname',
         'getRelationships'
      ]
   },
   Dispatcher: {
      props: [
         '_dispatch',
         'dirtyDispatch'
      ]
   },
   Modal: {
      props: [
         'openModal',
         'openModalLazy'
      ]
   },
   ContextMenu: {
      props: [
         'openContextMenu',
         'closeContextMenu'
      ]
   },
   Channels: {
      props: [
         'getChannelId',
         'getLastSelectedChannelId',
         'getVoiceChannelId'
      ]
   },
   constants: {
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
      props: [
         'highlight',
         'NUMBER_MODE'
      ]
   },
   zustand: {
      filter: m => typeof m === 'function' && m.toString().includes('[useStore, api]')
   }
}