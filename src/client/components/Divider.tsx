import { FormDivider } from '@components/discord';
import React from 'react';

interface DividerProps {
   direction?: 'HORIZONTAL' | 'VERTICAL';
   height?: any;
   width?: any;
   margin?: any;
   background?: any;
   [key: string]: any;
}

interface Divider extends React.FC<any> {
   Directions: {
      HORIZONTAL: 'HORIZONTAL',
      VERTICAL: 'VERTICAL';
   };
}

const Divider: Divider = ({ direction = 'VERTICAL', height, width, margin, background, ...rest }: DividerProps) => {
   if (direction === Divider.Directions.HORIZONTAL) {
      return <div
         style={{
            height: height ?? '24px',
            width: width ?? '1px',
            margin: margin ?? '0 8px',
            flex: '0 0 auto',
            background: background ?? 'var(--background-modifier-accent)'
         }}
         {...rest}
      />;
   }

   return <FormDivider {...rest} />;
};

Divider.Directions = {
   HORIZONTAL: 'HORIZONTAL',
   VERTICAL: 'VERTICAL'
};

export = Divider;