import React from 'react';

import { useColorMode, HStack, Button } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

import GitHubIcon from './GithubIcon';

export default function MiscButtons() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <HStack padding="0.5em 2rem">
      <Button variant="outline" onClick={() => { window.open('https://github.com/psidex/CustomBangSearch', '_blank')?.focus(); }}>
        <GitHubIcon boxSize={6} />
      </Button>
      <Button variant="outline" onClick={toggleColorMode}>
        {colorMode === 'light' ? <MoonIcon boxSize={5} /> : <SunIcon boxSize={5} />}
      </Button>
    </HStack>
  );
}
