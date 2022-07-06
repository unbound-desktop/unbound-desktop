import React from 'react';

function useForceUpdate() {
  return React.useReducer(() => ({}), {})[1];
}

export = useForceUpdate;