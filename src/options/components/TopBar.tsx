import React, { useRef } from 'react';
import {
  BangsType, SetBangsType, getDefaultBangs, newBangId, saveBangs, tryFileToBangs,
} from '../../lib/bangs';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
  unsavedChanges: Boolean
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>
}

export default function TopBar(props: PropsType): React.ReactElement {
  const {
    bangs, setBangs, unsavedChanges, setUnsavedChanges,
  } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const save = async (): Promise<void> => {
    await saveBangs(bangs);
    setUnsavedChanges(false);
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
    setUnsavedChanges(true);
  };

  const importBangs = (): void => {
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const fileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files === null) {
      return;
    }

    const newBangs = await tryFileToBangs(e.target.files[0]);
    if (newBangs !== null) {
      // TODO: Perhaps in the future we let user choose if they want to combine or overwrite?
      const combined = { ...bangs, ...newBangs };
      setBangs(combined);
      setUnsavedChanges(true);
    } else {
      // TODO: Alert user of invalid import.
    }
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
    setUnsavedChanges(true);
  };

  const openHelp = (): void => {
    window.open('https://github.com/psidex/CustomBangSearch#options-page');
  };

  const css = unsavedChanges ? { backgroundColor: 'red' } : {};

  return (
    <div>
      <button type="button" title="Save the current table" onClick={save} style={css}>Save</button>
      <button type="button" title="Add a new row to the table" onClick={addNew}>Add New</button>
      <button type="button" title="Import bangs from a file" onClick={importBangs}>Import</button>
      <input
        // TODO: Write some comments about using useRef and ref= to get element reference.
        ref={fileInputRef}
        id="importFileInput"
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={fileUpload}
      />
      <button type="button" title="Export bangs to a file" onClick={exportBangs}>
        Export
      </button>
      <button type="button" title="Reset to the default values" onClick={setDefaults}>Reset to Default</button>
      <button type="button" title="Show help page" onClick={openHelp}>Help</button>
    </div>
  );
}
