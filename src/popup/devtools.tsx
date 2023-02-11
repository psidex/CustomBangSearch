import React, { useState } from 'react';

import defaultSettings from '../lib/settings.default.json';
import { IecMessageType, sendIecMessage } from '../lib/iec';

export default function DevTools(): React.ReactElement {
  const [settingsNowSet, setSettingsNowSet] = useState<boolean>(true);

  async function resetSettings(): Promise<void> {
    setSettingsNowSet(false);
    const resp = await sendIecMessage({
      type: IecMessageType.SettingsSet,
      data: defaultSettings,
    });
    if (resp.type === IecMessageType.Error) {
      // eslint-disable-next-line no-alert
      alert(resp.data);
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
