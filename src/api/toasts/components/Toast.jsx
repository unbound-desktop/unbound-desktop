const { React, ReactSpring } = require('@webpack/common');
const Component = require('@structures/component');
const { animated } = ReactSpring;

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

   componentWillMount() {
      const { timeout } = this.props;

      this.timeout = setTimeout(() => {
         this.setState({ closing: true });
      }, timeout);
   }

   componentWillUnmount() {
      this.timeout && clearTimeout(this.timeout);
   }

   render() {
      const { content, store, id } = this.props;

      this.spring = ReactSpring.useSpring({
         from: { opacity: 1, height: '100%' },
         to: async (next, cancel) => {
            console.log('ran');
            console.log(this.ref.current?.offsetHeight);
            if (this.ref.current?.offsetHeight === 0) {
               await next({ opacity: 0 });
               store.delete(id);
            } else if (this.state.closing) {
               const height = this.ref.current.offsetHeight;
               const change = (height / 10).toFixed(0);

               do {
                  await next({ height: `${Math.max(change, 0)}px` });
               } while (this.ref.current.offsetHeight <= 0);
            } else {
               await next({ opacity: 1 });
            }
         }
      });

      return (
         <animated.div ref={this.ref} className='unbound-toast' style={{
            opacity: this.spring.opacity,
            height: this.spring.height.to(e => {
               console.log(e);
               return e;
               // if (!this.ref.current) return;
               // const height = this.ref.current.offsetHeight;
               // const change = parseInt(height / 10);

               // return `${change}px`;
            })
         }}>
            <div className='unbound-toast-content'>
               {content}
            </div>
         </animated.div>
      );
   }
};