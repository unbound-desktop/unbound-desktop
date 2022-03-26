const { React } = require('@webpack/common');

const Announcement = require('./Announcement');

module.exports = class Container extends React.Component {
   render() {
      const { storage } = this.props.store;

      return (
         <React.Fragment>
            {Object.entries(storage).map(([id, notice]) => (
               <Announcement {...notice} key={id} id={id} />
            ))}
         </React.Fragment>
      );
   }
};