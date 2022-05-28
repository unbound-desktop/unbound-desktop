const { Icon, Text, FormTitle, Button } = require('@components');
const { React, ReactSpring } = require('@webpack/common');
const Component = require('@structures/component');
const { Users } = require('@webpack/stores');
const { findByProps } = require('@webpack');

const [
   Colors,
   Markdown
] = findByProps(
   ['hex2int'],
   ['reactParserFor', 'parse'],
   { bulk: true }
);

const Parser = Markdown?.reactParserFor?.(Markdown.defaultRules);
const { useSpring, useTransition, animated } = ReactSpring;

module.exports = class Toast extends Component {
   constructor(props) {
      super(props);

      this.spring = null;
      this.timeout = null;
      this.ref = React.createRef();
      this.state = {
         closing: props.closing ?? false
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

   componentDidCatch() {
      this.setState({ crashed: true });
   }

   render() {
      let {
         icon: CustomIcon,
         color,
         title: Title,
         manager,
         content: Content,
         position,
         store,
         id,
         timeout,
         onClose,
         buttons,
         settings,
         onTimeout,
         toastProps = {},
      } = this.props;

      if (this.state.crashed) {
         Title = 'This toast failed to render.';
         CustomIcon = 'CloseCircle';
         color = 'var(--info-danger-foreground)';
         Content = 'The code that sent this toast is most likely broken.';
         buttons = null;
         onClose = null;
         timeout = null;
      }

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
            marginTop: 10,
            transform: `translateY(${isFromTop ? '-100%' : 0}) scale(1)`
         },
         enter: () => (next) => next({
            opacity: 1,
            marginTop: 10,
            height: this.ref.current?.getBoundingClientRect().height ?? 0,
            transform: `translateY(0) scale(1)`
         }),
         leave: {
            opacity: 0,
            height: 0,
            marginTop: 0,
            transform: `translateY(0) scale(0.75)`
         },
         onRest: () => {
            if (this.state.closing) {
               store.delete(id);
            }
         }
      };

      const transition = useTransition(!this.state.closing, spring);

      const bgColor = settings.get('bgColor', 0);
      const bgOpacity = settings.get('bgOpacity', 0.5);

      return <>
         {transition((props, item) => item && (<animated.div
            key={id}
            onMouseEnter={() => progress.value.pause()}
            onMouseLeave={() => progress.value.resume()}
            className='unbound-toast-wrapper'
            style={{ opacity: props.opacity, height: props.height, marginTop: props.marginTop }}
         >
            <animated.div
               ref={this.ref}
               data-color={color}
               data-use-custom={settings.get('useCustomColours', false)}
               style={{
                  transform: props.transform,
                  '--color': color,
                  '--bg': Colors.int2rgba(bgColor, bgOpacity),
                  '--blur': `${settings.get('blurAmount', 7.5)}px`
               }}
               className='unbound-toast'
               {...toastProps}
            >
               <div className='unbound-toast-header' data-has-content={Boolean(Content)}>
                  {
                     typeof CustomIcon === 'function' && <CustomIcon className='unbound-toast-icon' /> ||
                     typeof CustomIcon === 'string' && <Icon className='unbound-toast-icon' name={CustomIcon} />
                  }
                  {Title && <FormTitle className='unbound-toast-title' tag='h3'>
                     {
                        typeof Title === 'function' && <Title /> ||
                        typeof Title === 'string' && this.parse(Title)
                     }
                  </FormTitle>}
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
               <Text className='unbound-toast-content'>
                  {
                     typeof Content === 'function' && <Content /> ||
                     typeof Content === 'string' && this.parse(Content)
                  }
               </Text>
               {Array.isArray(buttons) && buttons.length && <div className='unbound-toast-buttons'>
                  {buttons.map((button, i) =>
                     <Button
                        color={Button.Colors[button.color?.toUpperCase() ?? 'BRAND_NEW']}
                        look={Button.Looks[button.look?.toUpperCase() || 'FILLED']}
                        size={Button.Sizes[button.size?.toUpperCase() || 'MIN']}
                        key={`button-${i}`}
                        className='unbound-toast-button'
                        onClick={() => {
                           button.onClick?.();
                           (button.close ?? true) && manager.close(id);
                        }}
                     >
                        {button.text}
                     </Button>
                  )}
               </div>}
               {timeout > 0 && <div className='unbound-toast-progress'>
                  <animated.div
                     className='unbound-toast-progress-bar'
                     style={{
                        width: progress.value.to(e => {
                           if (e >= 100 && timeout !== 0 && !this.state.closing) {
                              this.setState({ closing: true });
                              onTimeout?.();
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

   parse(content) {
      try {
         return Parser(content);
      } catch {
         return content;
      }
   }
};