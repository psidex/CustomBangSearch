import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  Heading, ChakraProvider, Tabs, TabList, TabPanels, Tab, HStack, useColorMode, Button,
  Box, useMediaQuery, useToast,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

import cloneDeep from 'lodash.clonedeep';

import theme from './theme';
import BangTabPanel from './components/BangsTabPanel';
import SettingsTabPanel from './components/SettingsTabPanel';
import AboutTabPanel from './components/AboutTabPanel';
import GitHubIcon from './components/GithubIcon';

import { ReactfulBangInfoContainer, storedBangInfoToReactful } from './reactful';
import { Settings, SettingsOptions, StoredBangInfo } from '../lib/settings';
import { IecMessage, IecMessageType, sendIecMessage } from '../lib/iec';

function App(): React.ReactElement {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  // Not very neat but CBA to do anything more complicated...
  const [windowIsAtLeast1200] = useMediaQuery('(min-width: 1200px)');
  const [windowIsAtLeast1600] = useMediaQuery('(min-width: 1600px)');
  const [windowIsAtLeast2200] = useMediaQuery('(min-width: 2200px)');

  const [loading, setLoading] = useState<boolean>(true);

  // Just so we know what's stored without having to ask for it lots.
  const [storedSettings, setStoredSettings] = useState<Settings>();

  // To be used to render information & changed by the user.
  const [options, setOptions] = useState<SettingsOptions>({ ignoreDomains: [], storage: { type: 'browser', url: '', key: '' } });
  const [bangInfos, setBangInfos] = useState<ReactfulBangInfoContainer>(new Map());

  // Update settings saved in sync storage. THe passed variable should come from the above states.
  const updateSettings = async (
    newOptions: SettingsOptions | undefined = undefined,
    newBangInfos: StoredBangInfo[] | undefined = undefined,
  ) => {
    if (storedSettings === undefined) {
      toast({
        title: 'Failed to set settings.',
        description: 'You haven\'t even loaded your original settings yet!',
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    // TODO: Do we definetly need to deep clone here? (overwriting nested mutable data?)
    //       Good test would be to console.log storedsettings before and after? does it change?
    // State vars are read only, no mutation!
    let newSettings: Settings = cloneDeep(storedSettings);

    if (newOptions !== undefined) {
      newSettings = { ...newSettings, ...{ options: newOptions } };
    }
    if (newBangInfos !== undefined) {
      newSettings = { ...newSettings, ...{ bangs: newBangInfos } };
    }

    const resp: IecMessage = await sendIecMessage({
      type: IecMessageType.SettingsSet,
      data: newSettings,
    });

    if (resp.type !== IecMessageType.Ok) {
      toast({
        title: 'Failed to set settings.',
        description: 'Probably just try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
    } else {
      setStoredSettings(newSettings);
      toast({
        title: 'Settings updated.',
        description: 'Saved to sync storage.',
        status: 'success',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  // On first load, set state from stored settings.
  useEffect(() => {
    const update = async () => {
      const resp: IecMessage = await sendIecMessage({
        type: IecMessageType.SettingsGet,
        data: null,
      });
      if (resp.type === IecMessageType.SettingsGetResponse) {
        setStoredSettings(resp.data as Settings);
        setBangInfos(storedBangInfoToReactful((resp.data as Settings).bangs));
        setOptions((resp.data as Settings).options);
        setLoading(false);
      } // FIXME: else some sort of error message?
    };
    update();
  }, []);

  if (loading) {
    return <Heading>Loading...</Heading>;
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
