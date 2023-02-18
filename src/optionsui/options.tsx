import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  Heading, ChakraProvider, Tabs, TabList, TabPanels, Tab, HStack, useColorMode, Button,
  Box, useMediaQuery,
} from '@chakra-ui/react';

import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import theme from './theme';
import BangTabPanel from './BangsTabPanel';
import SettingsTabPanel from './SettingsTabPanel';
import AboutTabPanel from './AboutTabPanel';

import { Settings } from '../lib/settings';
import { IecMessage, IecMessageType, sendIecMessage } from '../lib/iec';

import { ReactfulBangInfoContainer, storedBangInfoToReactful } from './reactful';
import GitHubIcon from './components/GithubIcon';

function App(): React.ReactElement {
  const { colorMode, toggleColorMode } = useColorMode();

  // Not very neat but CBA to do anything more complicated...
  const [windowIsAtLeast1200] = useMediaQuery('(min-width: 1200px)');
  const [windowIsAtLeast1600] = useMediaQuery('(min-width: 1600px)');
  const [windowIsAtLeast2200] = useMediaQuery('(min-width: 2200px)');

  const [loading, setLoading] = useState<boolean>(true);
  const [bangInfos, setBangInfos] = useState<ReactfulBangInfoContainer>(new Map());

  useEffect(() => {
    const update = async () => {
      const resp: IecMessage = await sendIecMessage({
        type: IecMessageType.SettingsGet,
        data: null,
      });
      if (resp.type === IecMessageType.SettingsGetResponse) {
        setBangInfos(storedBangInfoToReactful((resp.data as Settings).bangs));
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
          <BangTabPanel bangInfos={bangInfos} setBangInfos={setBangInfos} />
          <SettingsTabPanel />
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
