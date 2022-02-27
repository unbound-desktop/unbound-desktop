const { React } = require('@webpack/common');

module.exports = class DOMWrapper extends React.Component {
   constructor(...args) {
      super(...args);

      this.ref = React.createRef();
   }

   componentDidMount() {
      this.ref.current.appendChild(this.props.children);
   }

   render() {
      return <div className='react-dom-wrapper' ref={this.ref} />;
   }
};;