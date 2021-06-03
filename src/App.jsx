import React, { useEffect, useState } from 'react';
import './App.css';
import short from 'short-uuid';
import Buttons from './Buttons';
import BangsTable from './BangsTable';

// NOTE: Build script sets env var, see https://stackoverflow.com/questions/55160698 if interested

function App() {
  // TODO: Load bangs from browser or defaults, check against old structure and convert if needed.
  // TODO: Update defaults.json
  const initialBangs = {};
  for (let i = 0; i < 10; i += 1) {
    initialBangs[short.generate()] = {
      bang: 'm',
      url: 'https://www.google.com/maps/search/%s',
    };
  }

  const [bangs, setBangs] = useState(initialBangs);
  const [unsaved, setUnsaved] = useState(false);

  useEffect(() => {
    for (const [id, info] of Object.entries(bangs)) {
      console.log(`${id} :: ${info.bang} => ${info.url}`);
    }
  }, [bangs]);

  return (
    <div className="App">
      <Buttons bangs={bangs} setBangs={setBangs} unsaved={unsaved} setUnsaved={setUnsaved} />
      <BangsTable bangs={bangs} setBangs={setBangs} setUnsaved={setUnsaved} />
    </div>
  );
}

export default App;
