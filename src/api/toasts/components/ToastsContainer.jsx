const { React } = require('@webpack/common');
const Toast = require('./Toast');

module.exports = class ToastsContainer extends React.Component {
   constructor() {
      super();
   }

   render() {
      const { toasts } = this.props;

      return <>
         {Object.values(toasts.storage).map(data =>
            <Toast key={data.id} {...data} store={toasts} />
         )}
      </>;
   }
};