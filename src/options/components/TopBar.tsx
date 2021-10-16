import React from 'react';
import {
  BangsType, SetBangsType, getDefaultBangs, newBangId, saveBangs,
} from '../../lib/bangs';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
}

export default function TopBar(props: PropsType): React.ReactElement {
  const { bangs, setBangs } = props;

  const save = async (): Promise<void> => {
    // TODO: Un-highlight save button when this happens.
    await saveBangs(bangs);
  };

  const addNew = (): void => {
    // TODO: These 2 variables should be user inputs using a popup or something.
    const newBang = 'newbang';
    const newUrl = 'https://example.com?q=%s';

    const newId = newBangId();

    let largestPost = 1;
    for (const [, bangObj] of Object.entries(bangs)) {
      if (bangObj.pos > largestPost) {
        largestPost = bangObj.pos;
      }
    }

    const newBangs = { ...bangs };
    newBangs[newBang] = { id: newId, url: newUrl, pos: largestPost + 1 };
    setBangs(newBangs);
  };

  const importBangs = (): void => {
    // TODO:
  };

  const exportBangs = (): void => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bangs))}`;
    // React probably doesn't like this 😬
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'custombangs.json');
    a.click(); // Blocks until user performs action.
    a.remove();
  };

  const setDefaults = async (): Promise<void> => {
    const defaultBangs = await getDefaultBangs();
    setBangs(defaultBangs);
  };

  const openHelp = (): void => {
    window.open('https://github.com/psidex/CustomBangSearch#options-page');
  };

  return (
    <div>
      <button type="button" title="Save the current table" onClick={save}>Save</button>
      <button type="button" title="Add a new row to the table" onClick={addNew}>Add New</button>
      <button type="button" title="Import bangs from a file" onClick={importBangs}>Import</button>
      <button
        type="button"
        title="Export what is saved, not what's currently in the table"
        onClick={exportBangs}
      >
        Export
      </button>
      <button type="button" title="Reset to the default values" onClick={setDefaults}>Reset to Default</button>
      <button type="button" title="Show help page" onClick={openHelp}>Help</button>
    </div>
  );
}
