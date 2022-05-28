const { findByProps, find, filters: { byProps } } = require('@webpack');
const { bindAll, classnames } = require('@utilities');
const { Modal, Flex, Text } = require('@components');
const { makeStore } = require('@api/settings');
const { Modals } = require('@webpack/common');
const API = require('@structures/api');

const { Heading } = findByProps('Heading');
const classes = {
   ...find(m => Object.keys(m).length === 2 && byProps('modal')(m)),
   ...findByProps('premiumBanner')
};

const Settings = makeStore('unbound-changelog-api');

class Changelog extends API {
   constructor() {
      super();

      bindAll(this, ['show', 'Divider']);

      this.Colors = {
         GREEN: 'green',
         BLUE: 'blue',
         YELLOW: 'yellow',
         RED: 'red',
         ADDED: 'green',
         IMPROVED: 'blue',
         PROGRESS: 'yellow',
         FIXED: 'red',
      };
   }

   start() {
      const { Divider } = this;
      this.show('core', require('@core/../../index.json').version, () => <>
         <Divider color={this.Colors.ADDED} className={classes.marginTop}>
            New API
         </Divider>
         <ul>
            <li>
               Added <strong>Changelog</strong> API.
            </li>
         </ul>
      </>, 'Unbound Changelog', 'May 27, 2022');
   }

   stop() { }

   /**
    * @name show
    * @description Shows a changelog once everytime the version changes.
    * @param {string} file The string that will be used to track the changelog state.
    * @param {string} version The version that will be used to track the changelog state.
    * @param {() => JSX.Element} Content The content (a react component) that will be displayed in the changelog.
    * @param {string} [title] The title that will be displayed to the left of the close button.
    * @param {string} [date] The date that will be displayed under the title.
    * @returns {boolean} Wether or not the changelog was shown.
    */
   show(file, version, Content, title, date) {
      if (!Settings.get(file) || Settings.get(file) !== version) {
         Settings.set(file, version);

         Modals.openModal(event => (
            <Modal.ModalRoot {...event} className={classes.modal}>
               <Modal.ModalHeader align={Flex.Justify.BETWEEN} separator={false}>
                  <Flex.Child>
                     <Heading level={2} variant='heading-lg/medium'>
                        {title || `${file} Changelog`}
                     </Heading>
                     {date && (
                        <Text className={classes.date} variant='text-xs/normal'>
                           {date}
                        </Text>
                     )}
                  </Flex.Child>
                  <Flex.Child grow={0}>
                     <Modal.ModalCloseButton onClick={event.onClose} />
                  </Flex.Child>
               </Modal.ModalHeader>
               <Modal.ModalContent className={classes.content}>
                  <Content />
               </Modal.ModalContent>
            </Modal.ModalRoot>
         ));

         return true;
      } else {
         return false;
      }
   }

   /**
    * A recreation of the divider component used in the real changelog.
    * 
    * @param {object} props The props that will be passed to the divider.
    * @param {string} props.children The text that will be displayed in the divider.
    * @param {string} props.color The class name that will be applied to the divider.
    * @param {string} [props.className] The class name that will be applied to the heading element.
    * @param {object} [props.props] The custom props that will be applied to the heading element.
    */
   Divider({ children, color, className, ...props }) {
      if (typeof children !== 'string') {
         throw new TypeError('The children of the divider must be a string.');
      }

      if (typeof color !== 'string') {
         throw new TypeError('The property "color" must be a string.');
      }

      /**
       * The divider will look super wierd without this.
       */
      if (!children.endsWith(' ')) {
         children += ' ';
      }

      color = function () {
         switch (color) {
            case 'green':
               return classes.added;
            case 'blue':
               return classes.improved;
            case 'yellow':
               return classes.progress;
            case 'red':
               return classes.fixed;
         }
      }();

      return (
         <h1 className={classnames(color, className)} {...props ?? {}}>
            {children}
         </h1>
      );
   }
};

module.exports = new Changelog();