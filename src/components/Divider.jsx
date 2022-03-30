const { FormDivider } = require('@components');
const { React } = require('@webpack/common');

module.exports = class Divider extends React.Component {
   render() {
      const direction = this.props.direction;
      if (!direction || direction === Divider.Directions.VERTICAL) {
         return <FormDivider {...this.props} />;
      }

      return <div
         style={{
            height: this.props.height ?? '24px',
            width: this.props.width ?? '1px',
            margin: this.props.margin ?? '0 8px',
            flex: '0 0 auto',
            background: this.props.background ?? 'var(--background-modifier-accent)'
         }}
         {...this.props}
      />;
   }

   static Directions = {
      HORIZONTAL: 'HORIZONTAL',
      VERTICAL: 'VERTICAL'
   };
};