const { React } = require('@webpack/common');
const Settings = require('@api/settings');
const Toast = require('./Toast');

class ToastsContainer extends React.PureComponent {
   constructor(props) {
      super(props);

      this.state = {};
   }

   render() {
      const { toasts, settings, manager } = this.props;
      const position = settings.get('toastPosition', 'bottom-right');

      if (position === 'disabled') {
         return null;
      }

      return <div className='unbound-toasts-container' data-position={position}>
         {Object.values(toasts.storage).sort((a, b) => a.time - b.time).map(data =>
            <Toast
               {...data}
               key={data.id}
               settings={settings}
               manager={manager}
               store={toasts}
               position={position}
            />
         )}
      </div>;
   }
};

module.exports = Settings.connectComponent(ToastsContainer, 'unbound');