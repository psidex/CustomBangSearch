import React, { useEffect, useState } from 'react';

import { Text, Button } from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import defaultSettings from '../lib/settings.default.json';
import { IecMessageType, sendIecMessage } from '../lib/iec';

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
    const resp = await sendIecMessage({
      type: IecMessageType.SettingsSet,
      data: defaultSettings,
    });
    if (resp.type === IecMessageType.Error) {
      alert(resp.data as string);
    } else {
      setSettingsNowSet(true);
    }
  }

  return (
    <>
      <Button onClick={() => { resetSettings(); }}>Reset Stored Settings</Button>
      <Text>
        Setting set correctly:
        {' '}
        {settingsNowSet ? 'yes' : 'no'}
      </Text>
      <Text>{`Settings is storing ${storedSize} bytes`}</Text>
    </>
  );
}
