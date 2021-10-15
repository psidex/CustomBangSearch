import React from 'react';

export default function TopBar() {
  // How to use these buttons to interact with table?
  return (
    <div>
      <button id="saveBtn" type="button" title="Save the current table">Save</button>
      <button id="addRowBtn" type="button" title="Add a new row to the table">Add New</button>
      <button id="importBtn" type="button" title="Import bangs from a file">Import</button>
      <input id="importFileInput" type="file" />
      <button id="exportBtn" type="button" title="Export what is saved, not what's currently in the table">Export</button>
      <button id="setDefaultBtn" type="button" title="Reset to the default values">Reset to Default</button>
      <button id="helpBtn" type="button" title="Show help page">Help</button>
    </div>
  );
}
