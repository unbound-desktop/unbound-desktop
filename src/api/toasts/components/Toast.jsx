const { React, ReactSpring } = require('@webpack/common');
const { Icon, Text, FormTitle } = require('@components');
const Component = require('@structures/component');
const { close } = require('@api/toasts');

const { useSpring, useTransition, animated } = ReactSpring;

module.exports = class Toast extends Component {
   constructor() {
      super();

      this.spring = null;
      this.timeout = null;
      this.ref = React.createRef();
      this.state = {
         closing: false
      };
   }

   componentWillUnmount() {
      if (this.observer) this.observer.disconnect();
   }

   componentDidUpdate(prev) {
      if (prev.closing !== this.props.closing) {
         this.setState({ closing: this.props.closing });
      }
   }

   render() {
      const {
         icon: CustomIcon,
         color,
         title,
         manager,
         content,
         position,
         store,
         id,
         timeout,
         onClose
      } = this.props;

      const progress = useSpring({
         from: {
            value: 0
         },
         to: {
            value: 100
         },
         config: (key) => {
            switch (key) {
               case 'value': return {
                  duration: timeout
               };

               default: return {
                  duration: 0
               };
            }
         }
      });

      const isFromTop = position.includes('top');
      const spring = {
         config: {
            mass: 1,
            tension: 185,
            friction: 26
         },
         from: {
            opacity: 1,
            height: 0,
            transform: `translateY(${isFromTop ? '-100%' : 0}) scale(1)`
         },
         enter: () => (next) => next({
            opacity: 1,
            height: this.ref.current?.getBoundingClientRect().height ?? 'auto',
            transform: `translateY(0) scale(1)`
         }),
         leave: {
            opacity: 0,
            height: 0,
            transform: `translateY(0) scale(0.75)`
         },
         onRest: () => {
            if (this.state.closing) {
               store.delete(id);
            }
         }
      };

      const transition = useTransition(!this.state.closing, spring);

      return <>
         {transition((props, item) => item && (<animated.div
            key={id}
            onMouseEnter={() => progress.value.pause()}
            onMouseLeave={() => progress.value.resume()}
            className='unbound-toast-wrapper'
            style={{ opacity: props.opacity, height: props.height }}
         >
            <animated.div
               ref={this.ref}
               data-color={color}
               style={{
                  transform: props.transform,
                  '--color': color
               }}
               className='unbound-toast'
            >
               <div className='unbound-toast-header' data-has-content={Boolean(content)}>
                  {typeof CustomIcon === 'function' && <CustomIcon className='unbound-toast-icon' />}
                  {title && <FormTitle className='unbound-toast-title' tag='h3'>{title}</FormTitle>}
                  <Icon
                     className='unbound-toast-close'
                     name='Close'
                     onClick={() => {
                        manager.close(id);
                        onClose?.();
                     }}
                     onContextMenu={() => {
                        manager.closeAll();
                        onClose?.();
                     }}
                  />
               </div>
               <Text className='unbound-toast-content'>{content}</Text>
               {timeout > 0 && <div className='unbound-toast-progress'>
                  <animated.div
                     className='unbound-toast-progress-bar'
                     style={{
                        width: progress.value.to(e => {
                           if (e >= 100 && timeout !== 0 && !this.state.closing) {
                              this.setState({ closing: true });
                           }

                           return `${e}%`;
                        })
                     }}
                  />
               </div>}
            </animated.div>
         </animated.div>
         ))}
      </>;
   }
};