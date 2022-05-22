const { RelativeTooltip, Icon } = require('@components');
const React = require('react');

module.exports = class IconsPreview extends React.Component {
   render() {
      const icons = [];

      for (const icon of Icon.Names) {
         icons.push(<RelativeTooltip text={icon}>
            {p => <Icon
               {...p}
               className='unbound-show-the-icons-icon'
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
            />}
         </RelativeTooltip>
         );
      }

      return <div className='unbound-show-me-the-icons'>
         {icons}
      </div>;
   }
};