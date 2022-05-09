const { React } = require('@webpack/common');
const Settings = require('@api/settings');
const Toast = require('./Toast');

class ToastsContainer extends React.Component {
   constructor(props) {
      super(props);

      this.state = {};
   }

   render() {
      const { toasts, settings } = this.props;
      const position = settings.get('toastPosition', 'bottom-right');

      return <div className='unbound-toasts-container' data-position={position}>
         {Object.values(toasts.storage).map(data =>
            <Toast key={data.id} {...data} store={toasts} position={position} />
         )}
      </div>;
   }
};

module.exports = Settings.connectComponent(ToastsContainer, 'unbound');