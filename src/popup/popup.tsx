import React from 'react';
import ReactDOM from 'react-dom/client';
import browser from 'webextension-polyfill';

import { dev, version } from '../lib/esbuilddefinitions';

import DevTools from './devtools';

function App(): React.ReactElement {
  return (
    <div>
      <h1>Custom Bang Search</h1>
      <div className="versionInfo">
        <p>
          {`v${version}`}
        </p>
      </div>
      <button type="button" onClick={() => { browser.runtime.openOptionsPage(); }}>Options Page</button>
      {dev && <DevTools />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
