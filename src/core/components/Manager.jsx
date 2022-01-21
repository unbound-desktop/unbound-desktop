const { React } = require('@webpack/common');

module.exports = class extends React.PureComponent {
   constructor(props) {
      super();

      this.entities = [...unbound.managers[props.type]?.entities?.values() ?? []];

      this.state = {
         search: null
      };
   }

   render() {
      return <p style={{ color: 'white' }}>{this.props.type} manager</p>;
   }
};