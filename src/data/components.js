module.exports = {
   Button: {
      props: [
         'DropdownSizes'
      ]
   },
   Changelog: {
      filter: m => m.defaultProps?.selectable === false
   },
   FormNotice: {
      name: 'FormNotice'
   },
   Card: {
      name: 'Card'
   },
   Caret: {
      name: 'Caret'
   },
   Clickable: {
      name: 'Clickable'
   },
   Spinner: {
      name: 'Spinner'
   },
   FormTitle: {
      name: 'FormTitle'
   },
   FormItem: {
      name: 'FormItem'
   },
   FormText: {
      name: 'FormText'
   },
   HeaderBar: {
      name: 'HeaderBar'
   },
   TabBar: {
      name: 'TabBar'
   },
   Text: {
      name: 'LegacyText'
   },
   Flex: {
      name: 'Flex'
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
      name: 'FormDivider'
   },
   FormLabel: {
      name: 'FormLabel'
   },
   Switch: {
      name: 'Switch'
   },
   Markdown: {
      props: [
         'rules'
      ]
   },
   SearchBar: {
      name: 'SearchBar'
   },
   ScrollerThin: {
      props: [
         'AdvancedScrollerThin'
      ],
      prop: 'AdvancedScrollerThin'
   },
   Popout: {
      name: 'Popout'
   },
   Anchor: {
      name: 'Anchor'
   },
   TextInput: {
      name: 'TextInput'
   },
   Checkbox: {
      name: 'Checkbox'
   },
   Heading: {
      props: ['Heading'],
      prop: 'Heading'
   },
   RadioGroup: {
      name: 'RadioGroup'
   },
   SelectInput: {
      name: 'SelectTempWrapper'
   },
   Slider: {
      name: 'Slider'
   },
   Modal: {
      props: [
         'ModalCloseButton'
      ]
   },
   ConfirmModal: {
      name: 'ConfirmModal'
   }
};