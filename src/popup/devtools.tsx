import React from 'react';

import { Button } from '@chakra-ui/react';

import defaultSettings from '../lib/settings.default.json';
import * as storage from '../lib/storage';

export default function DevTools(): React.ReactElement {
  async function resetSettings(): Promise<void> {
    await storage.storeSettings(defaultSettings);
  }
  return (
    <Button onClick={() => { resetSettings(); }}>Reset Stored Settings</Button>
  );
}
