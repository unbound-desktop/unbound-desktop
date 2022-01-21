const { React } = require('@webpack/common');

module.exports = class extends React.PureComponent {
   render() {
      return <p style={{ color: 'white' }}>General settings</p>;
   }
};