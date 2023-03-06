import React, { useEffect, useState } from 'react';

import {
  FormControl, FormLabel, VStack, Switch, TabPanel, Heading,
} from '@chakra-ui/react';

import { SettingsOptions, StoredBangInfo } from '../../lib/settings';
import { hostPermissionUrls } from '../../lib/esbuilddefinitions';

type SettingsTabPanelPropTypes = {
  options: Readonly<SettingsOptions>
  setOptions: React.Dispatch<React.SetStateAction<SettingsOptions>>
  updateSettings: (newOptions?: SettingsOptions, newBangInfos?: StoredBangInfo[]) => Promise<void>
};

export default function OptionsTabPanel(props: SettingsTabPanelPropTypes): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { options, setOptions, updateSettings } = props;

  const [enableSwitches, setEnableSwitches] = useState<React.ReactElement[]>();

  const enableSwitchChanged = (e: any) => {
    let copy = [...options.ignoredDomains];
    const clickedUrl = e.target.id;

    if (copy.includes(clickedUrl)) {
      copy = copy.filter((url) => url !== clickedUrl);
    } else {
      copy.push(clickedUrl);
    }

    const newOptions = { ...options, ...{ ignoredDomains: copy } };
    updateSettings(newOptions, undefined);
    setOptions(newOptions);
  };

  useEffect(() => {
    const formControls = [];
    for (const url of hostPermissionUrls) {
      formControls.push(
        <FormControl key={url} display="flex" alignItems="center">
          <Switch id={`${url}`} isChecked={!options.ignoredDomains.includes(url)} onChange={enableSwitchChanged} />
          <FormLabel htmlFor={`${url}`} margin={0} marginLeft="1em">
            {url}
          </FormLabel>
        </FormControl>,
      );
    }
    setEnableSwitches(formControls);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <TabPanel>
      <Heading as="h4" size="md" marginBottom="1em">
        Enabled Domains
      </Heading>
      <VStack>
        {enableSwitches}
      </VStack>
    </TabPanel>
  );
}
