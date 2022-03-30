const { FormDivider } = require('@components');
const { React } = require('@webpack/common');

module.exports = class Divider extends React.Component {
   render() {
      if (this.props.direction === Divider.Directions.VERTICAL) {
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

      return <FormDivider {...this.props} />;
   }

   static Directions = {
      HORIZONTAL: 'HORIZONTAL',
      VERTICAL: 'VERTICAL'
   };
};