import React from 'react';

import { Button } from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import defaultSettings from '../lib/settings.default.json';
import * as storage from '../lib/storage';

export default function DevTools(): React.ReactElement {
  async function resetSettings(): Promise<void> {
    await storage.storeSettings(defaultSettings);
  }
  async function deleteSettings(): Promise<void> {
    await browser.storage.sync.remove(['settings']);
  }
  return (
    <>
      <Button onClick={() => { resetSettings(); }}>Reset Stored Settings</Button>
      <Button onClick={() => { deleteSettings(); }}>Delete Stored Settings</Button>
    </>
  );
}
