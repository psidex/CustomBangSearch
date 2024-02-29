import React, { useEffect, useState } from 'react';

import {
  FormControl, FormLabel, VStack, Switch, TabPanel, Heading, HStack, Text,
} from '@chakra-ui/react';

import { SettingsOptions, StoredBangInfo } from '../../lib/settings';
import { hostPermissionUrls } from '../../lib/esbuilddefinitions';

type SettingsTabPanelPropTypes = {
  options: Readonly<SettingsOptions>
  setOptions: React.Dispatch<React.SetStateAction<SettingsOptions>>
  updateSettings: (newOptions?: SettingsOptions, newBangInfos?: StoredBangInfo[]) => Promise<void>
};

export default function OptionsTabPanel(props: SettingsTabPanelPropTypes): React.ReactElement {
  const { options, setOptions, updateSettings } = props;

  const [enableDomainSwitches, setEnableDomainSwitches] = useState<React.ReactElement[]>();

  const enableDomainSwitchChanged = (e: any) => {
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

  const ignoreCaseSwitchChanged = () => {
    const newOptions = { ...options, ...{ ignoreCase: !options.ignoreCase } };
    updateSettings(newOptions, undefined);
    setOptions(newOptions);
  };

  const sortByAlphaSwitchChanged = () => {
    const newOptions = { ...options, ...{ sortByAlpha: !options.sortByAlpha } };
    updateSettings(newOptions, undefined);
    setOptions(newOptions);
  };

  useEffect(() => {
    const formControls = [];
    for (const url of hostPermissionUrls) {
      formControls.push(
        <FormControl key={url} display="flex" alignItems="center">
          <Switch id={`${url}`} isChecked={!options.ignoredDomains.includes(url)} onChange={enableDomainSwitchChanged} />
          <FormLabel htmlFor={`${url}`} margin={0} marginLeft="1em">
            {url}
          </FormLabel>
        </FormControl>,
      );
    }
    setEnableDomainSwitches(formControls);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <TabPanel>
      <VStack alignItems="stretch" gap="2em">
        <HStack>
          <VStack alignItems="start">
            <Heading as="h4" size="md" width="15em">
              Case Insensitive Bangs
            </Heading>
            <Text>
              For example, if active, !a and !A will be equivalent
            </Text>
          </VStack>
          <FormControl display="flex" alignItems="center">
            <Switch isChecked={options.ignoreCase} onChange={ignoreCaseSwitchChanged} />
          </FormControl>
        </HStack>
        <HStack>
          <VStack alignItems="start">
            <Heading as="h4" size="md" width="15em">
              Sort Bangs Alphabetically
            </Heading>
          </VStack>
          <FormControl display="flex" alignItems="center">
            <Switch isChecked={options.sortByAlpha} onChange={sortByAlphaSwitchChanged} />
          </FormControl>
        </HStack>
        <VStack alignItems="start">
          <Heading as="h4" size="md">
            Enabled Domains
          </Heading>
          <VStack>
            {enableDomainSwitches}
          </VStack>
        </VStack>
      </VStack>
    </TabPanel>
  );
}
