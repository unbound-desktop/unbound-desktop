const { Tooltip, Icon } = require('@components');
const React = require('react');

module.exports = class ShowMeTheFuckingIcons extends React.Component {
   render() {
      const icons = [];

      for (const icon of Icon.Names) {
         icons.push(<Tooltip text={icon}>
            <Icon
               author={{
                  getAvatarURL: () => { },
                  isVerifiedBot: () => { },
                  isSystemUser: () => { },
                  feedItem: () => { }
               }}
               user={{
                  getAvatarURL: () => { },
                  isVerifiedBot: () => { },
                  isSystemUser: () => { },
                  feedItem: () => { }
               }}
               feedItem={{
                  message: {
                     author: {
                        getAvatarURL: () => { },
                        isVerifiedBot: () => { },
                        isSystemUser: () => { },
                        feedItem: () => { }
                     }
                  }
               }}
               message={{
                  author: {
                     getAvatarURL: () => { },
                     isVerifiedBot: () => { },
                     isSystemUser: () => { },
                     feedItem: () => { }
                  }
               }}
               direction='RIGHT'
               name={icon}
            />
         </Tooltip>
         );
      }

      return icons;
   }
};