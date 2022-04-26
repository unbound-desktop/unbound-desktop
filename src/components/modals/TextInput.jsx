const { React } = require('@webpack/common');
const { getByProps } = require('@webpack');

const {
  Button,
  FormTitle,
  TextInput,
  Modal: {
    ModalRoot,
    ModalSize,
    ModalHeader,
    ModalFooter,
    ModalContent,
    ModalCloseButton
  }
} = require('@components');

const { ComponentActions } = require('@webpack/common').Constants;
const { ComponentDispatch } = getByProps('ComponentDispatcher');

/**
 * @name TextInputModal
 * @description A simple modal that displays a text input.
 * @param {object} props The props passed to the component.
 * @param {{ onClose: () => Promise<void>, transitionState: number }} props.event The first argument passed to the the openModal callback. 
 * @param {(input: string) => string | void} props.rejectFilter A function that is called on each keypress, if it returns a string the component will display an error with that string and not let the user submit, if it returns void there will be no error.
 * @param {string?} props.initialInput The initial value of the text input.
 * @param {string?} props.buttonText The text of the Submit button.
 * @param {string?} props.titleText The title of the modal.
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
module.exports = ({
  event,
  action,
  rejectFilter,
  initialInput = '',
  buttonText = 'Submit',
  titleText = 'Input Modal',
  placeholder = 'Both of my parents are divorced!',
}) => {
  const [input, _setInput] = React.useState(initialInput);
  const forceUpdate = React.useReducer(() => ({}), {})[1];

  // I'm making a fake state that can be read by memoized functions using useRef
  const rejectRef = React.useRef();
  React.useEffect(() => {
    if (input && rejectFilter)
      rejectRef.current = rejectFilter(input);

    // Mimic setState forceUpdate.
    forceUpdate();
  }, [input]);

  const inputRef = React.useRef();
  const setInput = (data) => {
    inputRef.current = data;
    _setInput(data);
  };

  const runAction = () => {
    if (rejectRef.current) {
      return ComponentDispatch.dispatch(ComponentActions.SHAKE_APP, {
        duration: 200,
        intensity: 2
      });
    }

    try {
      action(inputRef.current);
      event.onClose();
    } catch (error) {
      rejectRef.current = error;
      forceUpdate();
    }
  };

  const onEnter = (keyPressEvent) => {
    if (keyPressEvent.key === 'Enter')
      runAction();
  };

  React.useEffect(() => {
    document.addEventListener('keydown', onEnter);
    return () => document.removeEventListener('keydown', onEnter);
  }, []);

  return (
    <ModalRoot {...event} size={ModalSize.SMALL}>
      <ModalHeader>
        <FormTitle tag='h4'>{titleText}</FormTitle>
        <ModalCloseButton onClick={event.onClose} />
      </ModalHeader>
      <div style={{ marginTop: '10px' }} />
      <ModalContent>
        <TextInput
          value={input}
          onChange={setInput}
          error={rejectRef.current}
          placeholder={placeholder} />
      </ModalContent>
      <div style={{ marginTop: '10px' }} />
      <ModalFooter>
        <Button
          onClick={runAction}
          color={rejectRef.current ? Button.Colors.RED : Button.Colors.GREEN}>
          {buttonText}
        </Button>
        <Button
          onClick={event.onClose}
          look={Button.Looks.LINK}
          color={Button.Colors.TRANSPARENT}>
          Cancel
        </Button>
      </ModalFooter>
    </ModalRoot>
  );
};