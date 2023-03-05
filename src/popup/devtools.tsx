import React, { useEffect, useState } from 'react';

import { Text, Button } from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import defaultSettings from '../lib/settings.default.json';
import * as storage from '../lib/storage';

/* eslint-disable no-alert */

export default function DevTools(): React.ReactElement {
  const [settingsNowSet, setSettingsNowSet] = useState<boolean>(true);
  const [storedSize, setStoredSize] = useState<number>(0);

  useEffect(() => {
    const update = async () => {
      const biu = await browser.storage.sync.getBytesInUse(['settings']);
      setStoredSize(biu);
    };
    update();
  }, []);

  async function resetSettings(): Promise<void> {
    setSettingsNowSet(false);
    await storage.storeSettings(defaultSettings);
    setSettingsNowSet(true);
  }

  return (
    <>
      <Button onClick={() => { resetSettings(); }}>Reset Stored Settings</Button>
      <Text fontSize="1.25em">
        Setting set correctly:
        {' '}
        {settingsNowSet ? 'yes' : 'no'}
      </Text>
      <Text fontSize="1.25em">
        {`Storing ${storedSize}/${browser.storage.sync.QUOTA_BYTES_PER_ITEM} bytes (${(storedSize / (browser.storage.sync.QUOTA_BYTES_PER_ITEM / 100)).toFixed(1)}% of quota)`}
      </Text>
    </>
  );
}
