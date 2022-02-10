const { React } = require('@webpack/common');

module.exports = class HorizontalDivider extends React.Component {
   render() {
      return <div
         style={{
            height: this.props.height ?? '24px',
            width: this.props.width ?? '1px',
            margin: '0 8px',
            flex: '0 0 auto',
            background: 'var(--background-modifier-accent)'
         }}
      />;
   }
};