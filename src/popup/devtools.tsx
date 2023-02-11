import React, { useState } from 'react';

import defaultSettings from '../lib/settings.default.json';
import { IecMessageType, sendIecMessage } from '../lib/iec';

/* eslint-disable no-alert */

export default function DevTools(): React.ReactElement {
  const [settingsNowSet, setSettingsNowSet] = useState<boolean>(true);

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
    <div>
      <button type="button" onClick={() => { resetSettings(); }}>Reset Stored Settings</button>
      <p>
        Setting set correctly:
        {' '}
        {settingsNowSet ? 'yes' : 'no'}
      </p>
    </div>
  );
}
