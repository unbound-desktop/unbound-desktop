const { Anchor, Icon, Flex, Text, FormTitle, Changelog, Heading } = require('@components');
const { Modals, Moment, MarkdownParser } = require('@webpack/common');
const { makeStore } = require('@api/settings');
const { Invites } = require('@webpack/api');
const Unbound = require('@root/index.json');
const { getByProps } = require('@webpack');
const { bindAll } = require('@utilities');
const { strings } = require('@api/i18n');
const Constants = require('@constants');
const API = require('@structures/api');
const React = require('react');

const Settings = makeStore('unbound-changelog-api');

const ChangelogItem = require('./components/Item');
const classes = getByProps('premiumBanner');

class ChangelogAPI extends API {
   constructor() {
      super();

      bindAll(this, ['show']);
   }

   start() {
      // Show core changelog for unbound
      this.show({
         id: 'core',
         version: Unbound.version,
         image: Unbound.changelog.image,
         content: Unbound.changelog.items,
         title: 'Unbound',
         date: Unbound.updated,
         renderFooter: () => <>
            <Anchor href='https://twitter.com/unboundrip'>
               <Icon
                  className={classes.socialLink}
                  width={20}
                  height={20}
                  name='Twitter'
               />
            </Anchor>
            <Anchor href='https://unbound.rip'>
               <Icon
                  className={classes.socialLink}
                  width={20}
                  height={20}
                  name='Public'
               />
            </Anchor>
            <Icon
               className={classes.socialLink}
               width={20}
               height={20}
               name='Discord'
               style={{ cursor: 'pointer' }}
               onClick={() => {
                  Invites.acceptInviteAndTransitionToInviteChannel(Constants.invite);
                  Modals.closeAllModals();
               }}
            />
            <Text
               size={Text.Sizes.SMALL}
            >
               {strings.FOLLOW_US_FOR_MORE_UPDATES}
            </Text>
         </>
      });
   }

   /**
    * @name show
    * @description Shows a changelog once everytime the version changes.
    * @param {string} id The string that will be used to track the changelog state.
    * @param {string} version The version that will be used to track the changelog state.
    * @param {object[] | () => JSX.Element} content The content (a react component) that will be displayed in the changelog.
    * @param {string} [title] The title that will be displayed to the left of the close button.
    * @param {number} [date] The date that will be displayed under the title.
    * @returns {boolean} Wether or not the changelog was shown.
    */
   show({ id, version, content, title, date, image, showVersion = true, ...rest } = {}) {
      if (!id || typeof id !== 'string') {
         throw new TypeError('first argument file must be of type string');
      } else if (!version || typeof version !== 'string') {
         throw new TypeError('second argument version must be of type string');
      } else if (!content || typeof content !== 'function' && !Array.isArray(content)) {
         throw new TypeError('third argument content must by a react component or array');
      } else if (!date || typeof date !== 'number') {
         throw new TypeError('fifth argument date must be of type number');
      }

      const Content = !Array.isArray(content) ? content : content.map((item, idx) =>
         <>
            <ChangelogItem
               color={item.type?.toUpperCase()}
               classes={classes}
               isFirst={idx === 0}
            >
               {item.title}
            </ChangelogItem>
            <ul>
               {item.items.map(i => <li>
                  {MarkdownParser.parse(i)}
               </li>)}
            </ul>
         </>
      );

      if (!Settings.get(id) || Settings.get(id) !== version) {
         Settings.set(id, version);

         Modals.openModal(event => (
            <Changelog
               renderHeader={() => <>
                  <Flex.Child grow={1} shrink={1}>
                     <Heading level={2} variant='heading-lg/medium'>
                        {(title ?? id) + ` - ${strings.WHATS_NEW}`}
                     </Heading>
                     <FormTitle tag={FormTitle.Tags.H4}>
                     </FormTitle>
                     {date && <Text
                        size={Text.Sizes.SMALL}
                        color={Text.Colors.HEADER_SECONDARY}
                     >
                        {Moment(date).format('D MMM YYYY')} {showVersion && `- v${version}`}
                     </Text>}
                  </Flex.Child>
               </>}
               {...rest}
               {...event}
            >
               {image && <img
                  class={classes.image}
                  src={image}
                  width='451'
                  height='254'
               />}
               {Content}
               <div
                  aria-hidden='true'
                  style={{
                     position: 'absolute',
                     pointerEvents: 'none',
                     minHeight: 0,
                     minWidth: 1,
                     flex: '0 0 auto',
                     height: 20
                  }}
               />
            </Changelog>
         ));

         return true;
      } else {
         return false;
      }
   }
};

module.exports = new ChangelogAPI();