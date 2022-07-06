import React from 'react';

class DOMWrapper extends React.Component<any, any> {
  public ref: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);

    this.ref = React.createRef();
  }

  componentDidMount() {
    this.ref.current.appendChild(this.props.children);
  }

  render() {
    return <div className='react-dom-wrapper' ref={this.ref} />;
  }
};

export default DOMWrapper;