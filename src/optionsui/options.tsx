import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  Heading, ChakraProvider, Tabs, TabList, TabPanels, Tab, HStack, useColorMode, Button,
} from '@chakra-ui/react';

import theme from './theme';
import BangTabPanel from './BangsTabPanel';
import SettingsTabPanel from './SettingsTabPanel';
import AboutTabPanel from './AboutTabPanel';

import { Settings } from '../lib/settings';
import { IecMessage, IecMessageType, sendIecMessage } from '../lib/iec';

import { ReactfulBangInfoContainer, storedBangInfoToReactful } from './reactful';

function App(): React.ReactElement {
  const { colorMode, toggleColorMode } = useColorMode();
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

  return (
    <>
      <HStack>
        <Heading padding="0.5em 2rem">Custom Bang Search</Heading>
        <HStack alignSelf="end">
          <Button onClick={toggleColorMode}>
            Toggle
            {' '}
            {colorMode === 'light' ? 'Dark' : 'Light'}
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
    </>
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
