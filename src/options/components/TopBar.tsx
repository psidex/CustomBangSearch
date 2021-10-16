import React from 'react';
import {
  BangsType, SetBangsType, getDefaultBangs, newBangId,
} from '../../lib/bangs';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
}

export default function TopBar(props: PropsType): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bangs, setBangs } = props;

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

  const setDefaults = async (): Promise<void> => {
    const defaultBangs = await getDefaultBangs();
    setBangs(defaultBangs);
  };

  const openHelp = (): void => {
    window.open('https://github.com/psidex/CustomBangSearch#options-page');
  };

  return (
    <div>
      <button type="button" title="Save the current table">Save</button>
      <button type="button" title="Add a new row to the table" onClick={addNew}>Add New</button>
      <button type="button" title="Import bangs from a file">Import</button>
      <button type="button" title="Export what is saved, not what's currently in the table">Export</button>
      <button type="button" title="Reset to the default values" onClick={setDefaults}>Reset to Default</button>
      <button type="button" title="Show help page" onClick={openHelp}>Help</button>
    </div>
  );
}
