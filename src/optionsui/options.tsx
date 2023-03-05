import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  Heading, ChakraProvider, Tabs, TabList, TabPanels, Tab, HStack, useColorMode, Button,
  Box, useMediaQuery, useToast,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

import theme from './theme';
import BangTabPanel from './components/BangsTabPanel';
import SettingsTabPanel from './components/SettingsTabPanel';
import AboutTabPanel from './components/AboutTabPanel';
import GitHubIcon from './components/GithubIcon';

import { ReactfulBangInfoContainer, storedBangInfoToReactful } from './reactful';
import { Settings, SettingsOptions, StoredBangInfo } from '../lib/settings';
import * as storage from '../lib/storage';

// TODO: Some level of support for using the DDG bangs.

function App(): React.ReactElement {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  // Not very neat but CBA to do anything more complicated...
  const [windowIsAtLeast1200] = useMediaQuery('(min-width: 1200px)');
  const [windowIsAtLeast1600] = useMediaQuery('(min-width: 1600px)');
  const [windowIsAtLeast2200] = useMediaQuery('(min-width: 2200px)');

  const [loading, setLoading] = useState<boolean>(true);

  // Just so we know what's stored without having to ask for it lots.
  const storedSettings = useRef<Settings>();

  // To be used to render information & changed by the user.
  const [options, setOptions] = useState<SettingsOptions>({ ignoreDomains: [] });
  const [bangInfos, setBangInfos] = useState<ReactfulBangInfoContainer>(new Map());

  // Update settings saved in sync storage. THe passed variable should come from the above states.
  const updateSettings = async (
    newOptions: SettingsOptions | undefined = undefined,
    newBangInfos: StoredBangInfo[] | undefined = undefined,
  ) => {
    if (newOptions === undefined && newBangInfos === undefined) {
      return;
    }

    if (storedSettings.current === undefined) {
      toast({
        title: 'Failed to set settings',
        description: 'You haven\'t even loaded your original settings yet!',
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    let merger = { ...storedSettings.current };
    if (newOptions !== undefined) {
      merger = { ...merger, ...{ options: newOptions } };
    }
    if (newBangInfos !== undefined) {
      merger = { ...merger, ...{ bangs: newBangInfos } };
    }

    const newSettings: Settings = merger as Settings;

    try {
      await storage.storeSettings(newSettings);
      toast({
        title: 'Settings updated',
        description: 'Saved to sync storage.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      // TODO: Special case for "Error: QUOTA_BYTES_PER_ITEM quota exceeded"?
      toast({
        title: 'Failed to set settings',
        description: (err as Error).toString(),
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  // On first load, set state from stored settings.
  useEffect(() => {
    const update = async () => {
      const currentSettings = await storage.getSettings();
      if (currentSettings === undefined) {
        toast({
          title: 'Failed to get settings',
          description: 'getSettings returned undefined.',
          status: 'error',
          duration: null, // Display forever.
          isClosable: false,
          position: 'top',
        });
      } else {
        storedSettings.current = currentSettings;
        setBangInfos(storedBangInfoToReactful(currentSettings.bangs));
        setOptions(currentSettings.options);
        setLoading(false);
      }
    };
    update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let content: any;

  if (loading) {
    content = <Heading>Loading...</Heading>;
  } else {
    content = (
      <Tabs>
        <TabList>
          {/* Margin in the Tab allows the TabList horiz line to still fit the whole width */}
          <Tab marginLeft="2rem">Bangs</Tab>
          <Tab>Settings</Tab>
          <Tab>About</Tab>
        </TabList>
        <TabPanels paddingLeft="2rem">
          <BangTabPanel
            bangInfos={bangInfos}
            setBangInfos={setBangInfos}
            updateSettings={updateSettings}
          />
          <SettingsTabPanel
            options={options}
            setOptions={setOptions}
            updateSettings={updateSettings}
          />
          <AboutTabPanel />
        </TabPanels>
      </Tabs>
    );
  }

  // eslint-disable-next-line no-nested-ternary
  const widthPercent = windowIsAtLeast2200 ? '40%' : windowIsAtLeast1600 ? '60%' : windowIsAtLeast1200 ? '80%' : '100%';

  return (
    <Box width={widthPercent} margin="auto">
      <HStack justifyContent="space-between">
        <Heading padding="0.5em 2rem">Custom Bang Search</Heading>
        <HStack padding="0.5em 2rem">
          <Button variant="outline" onClick={() => { window.open('https://github.com/psidex/CustomBangSearch', '_blank')?.focus(); }}>
            <GitHubIcon boxSize={6} />
          </Button>
          <Button variant="outline" onClick={toggleColorMode}>
            {colorMode === 'light' ? <MoonIcon boxSize={5} /> : <SunIcon boxSize={5} />}
          </Button>
        </HStack>
      </HStack>
      {content}
    </Box>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
