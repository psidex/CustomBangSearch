import React from 'react';

import { TabPanel, Text } from '@chakra-ui/react';

export default function AboutTabPanel(): React.ReactElement {
  return (
    <TabPanel>
      <Text>
        Custom Bang Search is a browser extension to use custom DuckDuckGo-like bangs
        directly from the address bar.
      </Text>
      {/* TODO: Version information */}
      {/* TODO: Links to things */}
    </TabPanel>
  );
}
