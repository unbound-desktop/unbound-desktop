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
      ensure: (m) => Object.keys(m.Messages ?? {}).length > 50
   },
   HighlightJS: {
      props: [
         'highlight',
         'NUMBER_MODE'
      ]
   }
}