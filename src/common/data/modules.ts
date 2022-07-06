const modules = {
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
    filter: m => m?.toString === Function.toString && m.toString().includes('[useStore, api]')
  },
  Layers: {
    props: ['popLayer']
  },
  MarkdownParser: {
    props: ['parse', 'defaultRules']
  },
  Clyde: {
    props: ['createBotMessage']
  },
  Colors: {
    props: ['hex2rgb']
  },
  Stores: {
    submodule: true,
    items: {
      Users: {
        storeName: 'UserStore'
      },
      Channels: {
        storeName: 'ChannelStore'
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
      }
    }
  },
  Components: {
    submodule: true,
    items: {
      Button: {
        props: [
          'DropdownSizes'
        ]
      },
      Changelog: {
        filter: m => m.defaultProps?.selectable === false
      },
      FormNotice: {
        displayName: 'FormNotice'
      },
      Card: {
        displayName: 'Card'
      },
      Caret: {
        displayName: 'Caret'
      },
      Clickable: {
        displayName: 'Clickable'
      },
      Spinner: {
        displayName: 'Spinner'
      },
      FormTitle: {
        displayName: 'FormTitle'
      },
      FormItem: {
        displayName: 'FormItem'
      },
      FormText: {
        displayName: 'FormText'
      },
      HeaderBar: {
        displayName: 'HeaderBar'
      },
      TabBar: {
        displayName: 'TabBar'
      },
      Text: {
        displayName: 'LegacyText'
      },
      Flex: {
        displayName: 'Flex'
      },
      Tooltip: {
        props: [
          'TooltipContainer'
        ],
        prop: 'TooltipContainer'
      },
      RelativeTooltip: {
        props: [
          'TooltipContainer'
        ],
        prop: 'default'
      },
      Menu: {
        props: [
          'MenuGroup'
        ],
        assign: {
          default: 'Menu'
        }
      },
      FormDivider: {
        displayName: 'FormDivider'
      },
      FormLabel: {
        displayName: 'FormLabel'
      },
      Switch: {
        displayName: 'Switch'
      },
      Markdown: {
        props: [
          'rules'
        ]
      },
      SearchBar: {
        displayName: 'SearchBar'
      },
      Scrollers: {
        props: [
          'AdvancedScrollerThin'
        ]
      },
      Popout: {
        displayName: 'Popout'
      },
      Anchor: {
        displayName: 'Anchor'
      },
      TextInput: {
        displayName: 'TextInput'
      },
      Checkbox: {
        displayName: 'Checkbox'
      },
      Heading: {
        props: ['Heading'],
        prop: 'Heading'
      },
      RadioGroup: {
        displayName: 'RadioGroup'
      },
      SelectInput: {
        displayName: 'SelectTempWrapper'
      },
      Slider: {
        displayName: 'Slider'
      },
      Modal: {
        props: [
          'ModalCloseButton'
        ]
      },
      ConfirmModal: {
        displayName: 'ConfirmModal'
      }
    }
  },
  SettingsActions: {
    props: ['setSection', 'open']
  }
};

// @ts-ignore
export = modules;
export type Common = keyof typeof modules;