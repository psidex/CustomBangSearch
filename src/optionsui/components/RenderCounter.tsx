import React, { useRef } from 'react';

import { dev } from '../../lib/esbuilddefinitions';

// A simple render counter for debugging purposes.
// Can't use normal react debugging tools on extension pages :(
export default function RenderCounter() {
  const renderCounter = useRef(0);
  if (!dev) {
    return null;
  }
  renderCounter.current += 1;
  return (
    <h1>
      Renders:
      {' '}
      {renderCounter.current}
    </h1>
  );
}
