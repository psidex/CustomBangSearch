import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';
import ReactDOM from 'react-dom/client';

import {
  Heading, ChakraProvider, Tabs, TabList, TabPanels, Tab, HStack, Box, useMediaQuery,
  useToast, Text,
} from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import theme from '../lib/theme';
import BangTabPanel from './components/BangsTabPanel';
import OptionsTabPanel from './components/OptionsTabPanel';
import AboutTabPanel from './components/AboutTabPanel';

import { ReactfulBangInfoContainer, storedBangInfoToReactful } from './reactful';
import { Settings, SettingsOptions, StoredBangInfo } from '../lib/settings';
import * as storage from '../lib/storage';
import MiscButtons from '../lib/components/MiscButtons';
import { currentBrowser } from '../lib/esbuilddefinitions';

const BROWSER_QUOTA_BYTES_PER_ITEM = currentBrowser === 'chrome' ? browser.storage.sync.QUOTA_BYTES_PER_ITEM : 8192;

function App(): React.ReactElement {
  const toast = useToast();

  // Not very neat but CBA to do anything more complicated...
  const [windowIsAtLeast1200] = useMediaQuery('(min-width: 1200px)');
  const [windowIsAtLeast1600] = useMediaQuery('(min-width: 1600px)');
  const [windowIsAtLeast2200] = useMediaQuery('(min-width: 2200px)');

  const [loading, setLoading] = useState<boolean>(true);
  const [storedSize, setStoredSize] = useState<number>(0);

  // Just so we know what's stored without having to ask for it lots.
  const storedSettings = useRef<Settings>();

  // These 2 states are used to render information & are changed by user actions.
  const [options, setOptions] = useState<SettingsOptions>({ ignoredDomains: [] });
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [bangInfos, _setBangInfos] = useState<ReactfulBangInfoContainer>(new Map());
  const [bangChangesToSave, setBangChangesToSave] = useState(false);

  const setBangInfos = useCallback(
    (value: React.SetStateAction<ReactfulBangInfoContainer>): void => {
      setBangChangesToSave(true);
      _setBangInfos(value);
    },
    [setBangChangesToSave, _setBangInfos],
  );

  const updateUsedStorage = async () => {
    setStoredSize(await browser.storage.sync.getBytesInUse(['settings']));
  };

  // Update settings saved in sync storage. THe passed variable should come from the above states.
  const updateSettings = async (
    newOptions: SettingsOptions | undefined = undefined,
    newBangInfos: StoredBangInfo[] | undefined = undefined,
  ): Promise<void> => {
    if (newOptions === undefined && newBangInfos === undefined) {
      return;
    }

    if (storedSettings.current === undefined) {
      toast({
        title: 'Failed to set settings',
        description: 'storedSettings.current is undefined. This probably shouldn\'t happen...',
        status: 'error',
        duration: 10000,
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

    const seenBangs: Set<string> = new Set();
    for (const bangInfo of newSettings.bangs) {
      if (seenBangs.has(bangInfo.bang)) {
        toast({
          title: 'Failed to set settings',
          description: `Found 2 of the same bang: ${bangInfo.bang}`,
          status: 'error',
          duration: 10000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      seenBangs.add(bangInfo.bang);
    }

    try {
      storedSettings.current = newSettings;
      await storage.storeSettings(newSettings);
      setBangChangesToSave(false);
      updateUsedStorage();
      toast({
        title: 'Settings updated',
        description: 'Saved to sync storage.',
        status: 'success',
        duration: 2500,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      const errString = (err as Error).toString();
      let description = errString;
      if (errString.includes('QUOTA_BYTES_PER_ITEM')) {
        description += '. This is likely because you have reached your browsers storage limit for this extension...';
      }
      toast({
        title: 'Failed to set settings',
        description,
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
        // Use the _ function to bypass the updating of the save button.
        _setBangInfos(storedBangInfoToReactful(currentSettings.bangs));
        setOptions(currentSettings.options);
        setLoading(false);
        updateUsedStorage();
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
          <Tab>Options</Tab>
          <Tab>About</Tab>
        </TabList>
        <TabPanels paddingLeft="2rem">
          <BangTabPanel
            bangInfos={bangInfos}
            setBangInfos={setBangInfos}
            bangChangesToSave={bangChangesToSave}
            updateSettings={updateSettings}
          />
          <OptionsTabPanel
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
        <MiscButtons />
      </HStack>
      <Text paddingLeft="2.5rem" paddingBottom="0.5rem" fontSize="1.25em">
        {`Storing ${storedSize}/${BROWSER_QUOTA_BYTES_PER_ITEM} bytes (${(storedSize / (BROWSER_QUOTA_BYTES_PER_ITEM / 100)).toFixed(1)}%)`}
      </Text>
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
