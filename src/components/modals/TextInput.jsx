const { React, Constants: { ComponentActions } } = require('@webpack/common');
const { Button, FormTitle, TextInput, Modal } = require('@components');
const { getByProps } = require('@webpack');
const { bindAll } = require('@utilities');

const { ComponentDispatch } = getByProps('ComponentDispatcher');

/**
 * @name TextInputModal
 * @description A simple modal that displays a text input.
 * @param {object} props The props passed to the component.
 * @param {{ onClose: () => Promise<void>, transitionState: number }} props.event The first argument passed to the the openModal callback.
 * @param {(input: string) => string | void} props.rejectFilter A function that is called on each keypress, if it returns a string the component will display an error with that string and not let the user submit, if it returns void there will be no error.
 * @param {string?} props.value The initial value of the text input.
 * @param {string?} props.buttonText The text of the Submit button.
 * @param {string?} props.title The title of the modal.
 * @param {string?} props.placeholder The placeholder text of the text input.
 * @return {JSX.Element} Returns an instance of the function wrapped in a debounce
 *
 * @example
 *
 * ```
 * import { Modal } from '@webpack/common';
 * Modal.openModal(event => (
 *   <TextInputModal
 *     event={event}
 *     action={(input) => {
 *       // do something with the input...
 *     }}
 *   />
 * ));
 *
 * // There are two ways to reject the input:
 * // 1. Using props.rejectFilter:
 *   <TextInput
 *     event={event}
 *     rejectFilter={(input) => {
 *       if (input.length > 10)
 *        return 'Input is too long';
 *     }}
 *   />
 * // The reject filter will be called on every keypress, if it returns a string the component will display an error with that string and not let the user submit, if it returns void there will be no error.
 *
 * // 2. Throw inside props.action:
 *   <TextInput
 *     event={event}
 *     action={(input) => {
 *       if (api.isValid(input)) {
 *         // do something with the input...
 *       } else {
 *         throw 'Input is invalid!';
 *       }
 *     }}
 *   />
 * // The advantage to this method is that it's only called when the user clicks submit, so say if you need to make sparing api validation calls you can use this method.
 * // However, the disadvantage is that the user doesn't get immediate feedback on their input. (Psst! You might want to try wrapping your reject filter in require('@utilities/debounce') if you can make slightly more frequent calls!)
 * ```
 */

module.exports = class TextInputModal extends React.PureComponent {
   constructor(props) {
      super(props);

      this.state = {
         input: props.value ?? '',
         error: null
      };

      bindAll(this, ['handleSubmit', 'handleEnter']);
   }

   render() {
      const { event, buttonText, title, placeholder } = this.props;
      const { input } = this.state;

      return (
         <Modal.ModalRoot {...event} size={Modal.ModalSize.SMALL}>
            <Modal.ModalHeader>
               <FormTitle tag='h4'>
                  {title ?? 'Input Modal'}
               </FormTitle>
               <Modal.ModalCloseButton onClick={event.onClose} />
            </Modal.ModalHeader>
            <div style={{ marginTop: '10px' }} />
            <Modal.ModalContent>
               <TextInput
                  value={input}
                  onChange={v => this.setState({ input: v })}
                  error={this.state.error}
                  placeholder={placeholder ?? 'Enter a value...'}
               />
            </Modal.ModalContent>
            <div style={{ marginTop: '10px' }} />
            <Modal.ModalFooter>
               <Button
                  color={this.state.error ? Button.Colors.RED : Button.Colors.GREEN}
                  onClick={this.handleSubmit}
               >
                  {buttonText ?? 'Submit'}
               </Button>
               <Button
                  onClick={event.onClose}
                  look={Button.Looks.LINK}
                  color={Button.Colors.TRANSPARENT}
               >
                  Cancel
               </Button>
            </Modal.ModalFooter>
         </Modal.ModalRoot>
      );
   }

   shake() {
      ComponentDispatch.dispatch(ComponentActions.SHAKE_APP, {
         duration: 200,
         intensity: 2
      });
   }

   handleSubmit() {
      const { event, action } = this.props;
      const { error } = this.state;

      try {
         if (error) return this.shake();

         if (action && typeof action === 'function') {
            action(this.state.input);
         }

         if (event?.onClose) event.onClose();
      } catch (error) {
         this.shake();
         this.setState({ error: error.message ?? error });
      }
   }

   handleEnter(event) {
      if (event.key === 'Enter') {
         this.handleSubmit();
      }
   }

   componentDidMount() {
      document.addEventListener('keydown', this.handleEnter);
   }

   componentWillUnmount() {
      document.removeEventListener('keydown', this.handleEnter);
   }

   componentDidUpdate(_, state) {
      const { rejectFilter } = this.props;

      if (this.state.input !== state.input) {
         const hasError = rejectFilter?.(this.state.input) ?? false;

         if (hasError) {
            this.shake();
            this.setState({ error: hasError });
         } else {
            this.setState({ error: null });
         };
      }
   }
};