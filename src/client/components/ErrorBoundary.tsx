import { Card, Text, Scrollers, RelativeTooltip } from '@components/discord';
import { findByDisplayName } from '@webpack';
import { Regex } from '@constants';
import Divider from './Divider';
import React from 'react';

import Styles from '@styles/components/errorboundary.css';
Styles.append();

import Icon from './Icon';
const IntegrationInfo = findByDisplayName('IntegrationInfo');

interface ErrorBoundaryProps extends React.PropsWithChildren {
  fallback?: React.ComponentType<any>;
}

interface ErrorBoundaryState {
  error: boolean | string;
  component?: ErrorBoundaryError;
  js?: ErrorBoundaryError;
}

interface ErrorBoundaryError {
  message: string;
  stack: string;
}

class ErrorBoundary extends React.PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);

    this.state = {
      error: false
    };
  }

  componentDidCatch(error, { componentStack }) {
    const message = `${error.name ? `${error.name}: ` : ''}${error.message}`;
    const js = this.cleanError(error.stack, message);
    const component = this.cleanError(componentStack);

    this.setState({
      error: true,
      component,
      js
    });
  };

  cleanError(string: string, message?: string) {
    const clean = (stack) => Boolean(stack) && !stack.includes('/assets');

    const sections = string.split(Regex.newline);

    if (message) {
      const index = sections.findIndex(m => m === message);
      index !== null && sections.splice(index, 1);
    }

    return {
      stack: sections.filter(clean).join('\n').replace(/    /g, ''),
      message
    };
  }

  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback;

      if (Fallback) {
        return <Fallback {...this.state} />;
      }

      const js = {
        name: 'JavaScript Error',
        description: 'Runtime error provided by JavaScript.',
        icon: 'Close',
        state: 'js'
      };

      const component = {
        name: 'Component Lifecycle',
        description: 'Lifecycle error provided by React.',
        icon: 'Synced',
        state: 'component'
      };

      return (
        <div className='unbound-boundary-wrapper'>
          <img
            src='/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg'
            className='unbound-boundary-sad-wumpus'
          />
          <Text
            color={Text.Colors.MUTED}
            size={Text.Sizes.SIZE_16}
            className='unbound-boundary-notice'
          >
            Oops, we had a fucky wucky.
          </Text>
          <RelativeTooltip text='Retry'>
            {props => <Icon
              {...props}
              className='unbound-boundary-retry'
              name='Replay'
              width={32}
              height={32}
              onClick={() => this.setState({ error: false })}
            >
              Retry
            </Icon>}
          </RelativeTooltip>
          {this.renderStack(js)}
          {this.renderStack(component)}
        </div>
      );
    }

    return this.props.children;
  }

  renderStack({ name, state, description, icon }) {
    const isOpen = this.state[`${state}Open`] ?? false;
    const error = this.state[state];

    if (!error) return null;

    return (
      <Card
        onClick={() => this.setState<any>({ [`${state}Open`]: !isOpen })}
        className='unbound-boundary-integration-card'
      >
        <div className='unbound-boundary-align'>
          <IntegrationInfo
            name={name}
            icon={props => <Icon name={icon} {...props} />}
            details={[{ text: description }]}
          />
          <Icon
            name={`ArrowDrop${isOpen ? 'Up' : 'Down'}`}
            className='unbound-boundary-integration-icon'
          />
        </div>
        {isOpen && <>
          <Divider className='unbound-boundary-divider' />
          {error.message && <Card
            type='card'
            className='unbound-boundary-error-wrapper'
          >
            <Scrollers.AdvancedScrollerThin className='unbound-boundary-scroller'>
              <Text className='unbound-boundary-error-details'>
                {error.message}
              </Text>
            </Scrollers.AdvancedScrollerThin>
          </Card>}
          {error.stack && <Card
            type='card'
            className='unbound-boundary-error-wrapper'
          >
            <Scrollers.AdvancedScrollerThin className='unbound-boundary-scroller'>
              <Text className='unbound-boundary-error-details'>
                {error.stack}
              </Text>
            </Scrollers.AdvancedScrollerThin>
          </Card>}
        </>}
      </Card>
    );
  }
};

export = ErrorBoundary;