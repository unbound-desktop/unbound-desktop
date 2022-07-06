import { connectComponent } from '@api/settings';
import Toast, { ToastOptions } from './Toast';
import React from 'react';

class ToastsContainer extends React.PureComponent<any> {
  constructor(props) {
    super(props);

    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(): void {
    const { manager } = this.props;
    manager.on('change', this.handleChange);
  }

  componentWillUnmount(): void {
    const { manager } = this.props;
    manager.off('change', this.handleChange);
  }

  handleChange() {
    this.forceUpdate();
  }

  render() {
    const { toasts, settings, manager } = this.props;
    const position = settings.get('toasts.position', 'bottom-right');

    if (position === 'disabled') {
      return null;
    }

    const payload = (Object.values(toasts.storage) as ToastOptions[]).sort((a: any, b: any) => a.time - b.time);
    return <div className='unbound-toasts-container' data-position={position}>
      {(~position.indexOf('top') ? payload.reverse() : payload).map(data =>
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

export default connectComponent(ToastsContainer, 'unbound', ({ key }: { key: string; }) => key.startsWith('toasts.'));