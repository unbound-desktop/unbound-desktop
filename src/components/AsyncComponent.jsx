const { React } = require('@webpack/common');

module.exports = class AsyncComponent extends React.PureComponent {
   constructor(props) {
      super(props);

      this.state = {
         resolved: null
      };
   }

   render() {
      const Component = this.state.resolved;
      const suspense = this.props.suspense;
      const props = { ...this.props };
      delete props.component;
      delete props.suspense;

      if (Component) {
         return <Component {...props} />;
      }

      return suspense || null;
   }

   async componentDidMount() {
      const res = await this.props.component();
      this.setState({ resolved: res });
   }

   static from(promise, suspense) {
      return React.memo(props => <AsyncComponent
         component={promise}
         suspense={suspense}
         {...props}
      />);
   }
};;