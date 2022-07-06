import React from 'react';

interface AsyncComponentProps {
  suspense?: JSX.Element;
  component: CallableFunction;
  [key: string]: any;
}

interface AsyncComponentState {
  resolved: JSX.Element | void;
}

class AsyncComponent extends React.PureComponent<AsyncComponentProps, AsyncComponentState> {
  constructor(props) {
    super(props);

    this.state = {
      resolved: null
    };
  }

  render() {
    if (this.state.resolved) {
      const Component = this.state.resolved as any as React.ElementType;

      const props = { ...this.props };
      delete props.component;
      delete props.suspense;

      return <Component {...props} />;
    }

    return this.props.suspense || null;
  }

  async componentDidMount() {
    const res = await this.props.component();
    this.setState({ resolved: res });
  }

  static from(promise: (...args) => Promise<any>, suspense?: JSX.Element): React.ComponentType<any> {
    return React.memo(props => <AsyncComponent
      component={promise}
      suspense={suspense}
      {...props}
    />);
  }
};

export = AsyncComponent;