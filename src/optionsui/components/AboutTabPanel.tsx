import React from 'react';

import { TabPanel, Text } from '@chakra-ui/react';

export default function AboutTabPanel(): React.ReactElement {
  return (
    <TabPanel>
      <Text fontSize="xl">
        Custom Bang Search is a browser extension to use custom DuckDuckGo-like bangs
        directly from the address bar.
      </Text>
      {/* TODO: Copy info from new readme? */}
      {/* TODO: Version information */}
      {/* TODO: Links to things */}
    </TabPanel>
  );
}
