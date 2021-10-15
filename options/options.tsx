import React from 'react';
import ReactDOM from 'react-dom';
import TopBar from './components/TopBar';

function Test(): React.ReactElement {
  return (
    <div>
      <h1>test</h1>
      <TopBar />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Test />
  </React.StrictMode>,
  document.getElementById('root'),
);
