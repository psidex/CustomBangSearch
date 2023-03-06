import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  ChakraProvider, Heading, Button, Text, VStack,
} from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import DevTools from './devtools';

import { dev, version } from '../lib/esbuilddefinitions';

// TODO: Theme switch in popup as well?

function App(): React.ReactElement {
  return (
    <VStack>
      <Heading>Custom Bang Search</Heading>
      <Text>{`v${version}`}</Text>
      <Button onClick={() => { browser.runtime.openOptionsPage(); }}>Open Options page</Button>
      {dev && <DevTools />}
    </VStack>
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
