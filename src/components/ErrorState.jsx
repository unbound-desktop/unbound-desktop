const { classnames } = require('@utilities');
const { React } = require('@webpack/common');
const { getByProps } = require('@webpack');
const { Text } = require('@components');
const Icon = require('./Icon');

const classes = getByProps('error', 'backgroundRed');

module.exports = class ErrorState extends React.PureComponent {
   render() {
      const { error, backgroundRed, icon, text } = classes;

      return (
         <div className={classnames(error, backgroundRed)}>
            <Icon className={icon} name='WarningCircle' />
            <Text className={text}>
               {this.props.text ?? 'Error'}
            </Text>
         </div>
      );
   }
};