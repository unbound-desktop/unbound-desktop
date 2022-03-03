const { React } = require('@webpack/common');
const { Notices } = require('@components');
const logger = require('@modules/logger');

const Colors = Notices.NoticeColors;
const CloseButton = Notices.NoticeCloseButton;
const Button = Notices.NoticeButtonAncor;

module.exports = class Announcement extends React.Component {
   constructor(...args) {
      super(...args);

      this.logger = new logger('API', 'Announcements', this.props.id);
   }

   render() {
      const Color = this.props.color?.toLowerCase?.();
      const color = Colors.find(c => c.toLowerCase() === Color) ?? Colors.BRAND_1;
      const Notice = Notices.Notice;

      return (
         <Notice color={color} id={this.props.id}>
            <CloseButton onClick={() => this.handleClick(this.props.callback)} />
            {this.props.message ?? 'No message.'}
            {this.props.button && (
               <Button onClick={() => this.handleClick(this.props.button.onClick)}>
                  {this.props.button.text}
               </Button>
            )}
         </Notice>
      );
   };

   handleClick(callback) {
      try {
         unbound.apis.announcements.close(this.props.id);
         if (typeof callback === 'function') callback();
      } catch (err) {
         return this.logger.error(err);
      }
   }
};