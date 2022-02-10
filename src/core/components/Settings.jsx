const { React } = require('@webpack/common');

const { ErrorBoundary } = require('@components');

module.exports = class Settings extends React.PureComponent {
   render() {
      return <ErrorBoundary>
         <p style={{ color: 'white' }}>General settings</p>;
      </ErrorBoundary>;
   }
};