import { MarkdownParser, ReactSpring } from '@webpack/common';
import { Text, FormTitle, Button } from '@components/discord';
import { DropdownButton } from 'discord-types/components';
import Component from '@structures/component';
import { Icon } from '@components';
import React from 'react';

const Parser = MarkdownParser?.reactParserFor?.(MarkdownParser.defaultRules);
const { useSpring, useTransition, animated } = ReactSpring;

type IconDisplayName = any;

export interface ToastOptions {
   icon?: IconDisplayName | ((props: { className: 'unbound-toast-icon'; }) => JSX.Element);
   color?: string;
   title?: string | React.ComponentType<any>;
   content?: string | React.ComponentType<any>;
   id?: string;
   timeout?: number;
   closing?: boolean;
   onClose?: () => void;
   onTimeout?: () => void;
   toastProps?: any,
   buttons?: {
      text: string;
      color?: keyof DropdownButton['Colors'];
      look?: keyof DropdownButton['Looks'];
      size?: keyof DropdownButton['Sizes'];
      onClick?: () => void;
      close?: boolean;
   }[];
}

export default class Toast extends Component {
   public props: React.PropsWithChildren<any>;
   public ref: React.RefObject<any>;
   public state: Record<string, any>;
   public setState: any;

   constructor(props: ToastOptions) {
      super();

      this.ref = React.createRef();
      this.state = {
         closing: props.closing ?? false,
         hovered: false
      };
   }

   componentDidUpdate(prev) {
      if (prev.closing !== this.props.closing) {
         this.setState({ closing: this.props.closing });
      }
   }

   componentDidCatch() {
      this.setState({ crashed: true });
   }

   int2rgba(int: number, opacity: number) {
      return `rgba(${(int >> 24) & 0xFF},g: ${(int >> 16) & 0xFF},${(int >> 8) & 0xFF}, ${opacity})`;
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
      } = this.props as any;

      if (timeout === Infinity) {
         timeout = 0;
      }

      if (this.state.crashed) {
         Title = 'This toast failed to render.';
         CustomIcon = 'CloseCircle';
         color = 'var(--info-danger-foreground)';
         Content = 'The code that sent this toast is most likely broken.';
         buttons = null;
         onClose = null;
         timeout = null;
      }

      const progressConfig = {
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
      };

      const isFromTop = ~position.indexOf('top');

      const progress = useSpring(progressConfig);
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
               delete store.storage[id];
            }
         }
      };

      const transition = useTransition(!this.state.closing, spring);

      const bgColor = settings.get('toasts.bgColor', 0);
      const bgOpacity = settings.get('toasts.bgOpacity', 0.5);

      return <>
         {transition((props, item) => item && (<animated.div
            key={id}
            className='unbound-toast-wrapper'
            style={{ opacity: props.opacity, height: props.height, marginTop: props.marginTop }}
            onMouseEnter={() => {
               if (settings.get('toasts.resetTimeoutOnHover', false)) {
                  progress.value.to(v => {
                     progress.value.start({
                        config: {
                           mass: 1,
                           tension: 500,
                           friction: 50,
                           clamp: true
                        },
                        from: v,
                        to: 0
                     });
                  });
               } else {
                  progress.value.pause();
               }
            }}
            onMouseLeave={() => {
               if (settings.get('toasts.resetTimeoutOnHover', false)) {
                  progress.value.start(progressConfig);
               } else {
                  progress.value.resume();
               }
            }}
         >
            <animated.div
               ref={this.ref}
               data-color={color}
               data-use-custom={settings.get('toasts.useCustomColours', false)}
               style={{
                  transform: props.transform,
                  '--color': color,
                  '--bg': this.int2rgba(bgColor, bgOpacity),
                  '--blur': `${settings.get('toasts.blurAmount', 7.5)}px`
               }}
               className='unbound-toast'
               {...toastProps}
            >
               <div style={{ padding: timeout > 0 ? '10px 10px 6.5px 10px' : 10 }}>
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
               </div>
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