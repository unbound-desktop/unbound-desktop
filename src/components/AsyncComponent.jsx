const { React } = require('@webpack/common');

module.exports = class AsyncComponent extends React.PureComponent {
   constructor(props) {
      super(props);

      this.state = { resolved: null };
   }

   render() {
      const { resolved } = this.state;

      return (
         resolved && <resolved {...this.props.childProps} /> ||
         this.props.suspense || null
      );
   }

   async componentDidMount() {
      this.setState({ resolved: await this.props.component() });
   }

   static from(promise, suspense) {
      return React.memo(props => <AsyncComponent
         component={promise}
         suspense={suspense}
         {...props}
      />);
   }
};;