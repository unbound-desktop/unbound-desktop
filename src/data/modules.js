module.exports = {
   messages: {
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
   modal: {
      props: [
         'openModal',
         'openModalLazy'
      ]
   },
   contextMenu: {
      props: [
         'openContextMenu',
         'closeContextMenu'
      ]
   },
   channels: {
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