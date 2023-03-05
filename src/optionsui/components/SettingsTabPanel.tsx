import React from 'react';

import { TabPanel, Text } from '@chakra-ui/react';

import { SettingsOptions } from '../../lib/settings';

type SettingsTabPanelPropTypes = {
  options: Readonly<SettingsOptions>
  setOptions: React.Dispatch<React.SetStateAction<SettingsOptions>>
  updateSettings: Function // FIXME
};

export default function SettingsTabPanel(props: SettingsTabPanelPropTypes): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { options, setOptions, updateSettings } = props;

  return (
    <TabPanel>
      <Text>Settings</Text>
      <Text>{`Ignored domains: ${options.ignoredDomains}`}</Text>
    </TabPanel>
  );
}
