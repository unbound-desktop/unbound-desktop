const { React, ReactSpring } = require('@webpack/common');
const Component = require('@structures/component');
const { FormTitle } = require('@components');

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
      const { title, content, position, store, id, timeout } = this.props;

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
            transform: `translateY(0) scale(0.9)`
         },
         onRest: () => {
            if (this.state.closing) {
               store.delete(id);
            }
         }
      };

      const transition = useTransition(!this.state.closing, spring);

      return <>
         {transition((props, item) => {
            if (!item) return null;

            return (
               <animated.div
                  key={id}
                  onMouseEnter={() => progress.value.pause()}
                  onMouseLeave={() => progress.value.resume()}
                  className='unbound-toast-wrapper'
                  style={{
                     opacity: props.opacity,
                     height: props.height,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center'
                  }}
               >
                  <animated.div
                     ref={this.ref}
                     style={{
                        transform: props.transform,
                        pointerEvents: 'auto'
                     }}
                     className='unbound-toast'
                  >
                     <div className='unbound-toast-header'>
                        {title && <FormTitle>
                           {title}
                        </FormTitle>}
                     </div>
                     <p>{content}</p>
                     {timeout > 0 && <div className="unbound-toast-progress">
                        <animated.div
                           className="unbound-toast-progress-bar"
                           style={{
                              width: progress.value.to(e => {
                                 if (e > 97 && timeout !== 0 && !this.state.closing) {
                                    this.setState({ closing: true });
                                 }

                                 return `${e}%`;
                              })
                           }}
                        >

                        </animated.div>
                     </div>}
                  </animated.div>
               </animated.div>
            );
         })}
      </>;
   }
};