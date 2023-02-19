import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  ChakraProvider, Heading, Button, Text, VStack,
} from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import DevTools from './devtools';

import { dev, version } from '../lib/esbuilddefinitions';

// TODO: Some level of support for using the DDG bangs.

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

// TODO: In all code, for all states, deep copy, never mutate state.
