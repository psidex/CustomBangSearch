import React from 'react';
import { BangsType, getDefaultBangs, SetBangsType } from '../lib/bangs';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
}

export default function TopBar(props: PropsType): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bangs, setBangs } = props;

  const setDefaults = async (): Promise<void> => {
    const defaultBangs = await getDefaultBangs();
    await setBangs(defaultBangs);
  };

  return (
    <div>
      <button type="button" title="Save the current table">Save</button>
      <button type="button" title="Add a new row to the table">Add New</button>
      <button type="button" title="Import bangs from a file">Import</button>
      <button type="button" title="Export what is saved, not what's currently in the table">Export</button>
      <button type="button" title="Reset to the default values" onClick={setDefaults}>Reset to Default</button>
      <button type="button" title="Show help page">Help</button>
    </div>
  );
}
