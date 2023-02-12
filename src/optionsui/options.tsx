import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  Heading, ChakraProvider, Tabs, TabList, TabPanels, Tab,
} from '@chakra-ui/react';

import BangTabPanel from './BangsTabPanel';
import SettingsTabPanel from './SettingsTabPanel';
import AboutTabPanel from './AboutTabPanel';

// TODO: Some level of support for using the DDG bangs.

function App(): React.ReactElement {
  return (
    <>
      <Heading margin="0.5em 2rem">Custom Bang Search</Heading>
      <Tabs>
        <TabList>
          {/* Margin in the Tab allows the TabList horiz line to still fit the whole width */}
          <Tab marginLeft="2rem">Bangs</Tab>
          <Tab>Settings</Tab>
          <Tab>About</Tab>
        </TabList>

        <TabPanels marginLeft="2rem">
          <BangTabPanel />
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
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
