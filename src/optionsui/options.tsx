import React from 'react';
import ReactDOM from 'react-dom/client';

// TODO: Some level of support for using the DDG bangs.

function App(): React.ReactElement {
  return <h1>Hello Options Page</h1>;
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
