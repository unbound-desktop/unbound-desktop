const { classnames } = require('@utilities');
const React = require('react');

module.exports = class Item extends React.Component {
   render() {
      let { color, children, className, classes, isFirst, headerProps = {} } = this.props;

      if (typeof children !== 'string' || typeof color !== 'string') {
         return null;
      }

      /**
       * The header will look super weird without this.
       */
      if (!children.endsWith(' ')) {
         children += ' ';
      }

      color = Item.Colors[color] ?? Item.Colors.GREEN;

      switch (color) {
         case 'green':
            color = classes.added;
            break;
         case 'blue':
            color = classes.improved;
            break;
         case 'yellow':
            color = classes.progress;
            break;
         case 'red':
            color = classes.fixed;
            break;
      }

      return (
         <h1 className={classnames(color, className, isFirst && classes.marginTop)} {...headerProps}>
            {children}
         </h1>
      );
   }

   static get Colors() {
      return {
         GREEN: 'green',
         BLUE: 'blue',
         YELLOW: 'yellow',
         RED: 'red',
         ADDED: 'green',
         IMPROVED: 'blue',
         PROGRESS: 'yellow',
         FIXED: 'red',
      };
   }
};