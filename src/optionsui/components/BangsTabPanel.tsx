import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';

import {
  Box,
  Button, HStack, Menu, MenuButton, MenuItem, MenuList, TabPanel, useToast, VStack, Text,
} from '@chakra-ui/react';
import {
  CheckIcon, PlusSquareIcon, RepeatIcon, DownloadIcon, ChevronDownIcon,
} from '@chakra-ui/icons';

import { nanoid } from 'nanoid';

import {
  ReactfulBangInfoContainer, reactfulBangInfoToStored, storedBangInfoToReactful, ReactfulBangInfo,
} from '../reactful';
import BangInfo from './BangInfo';
import {
  SettingsOptions, StoredBangInfo, BangsExport, currentSettingsVersion,
} from '../../lib/settings';
import defaultSettings from '../../lib/settings.default.json';
import RenderCounter from './RenderCounter';

const defaultReactfulBangs = storedBangInfoToReactful(defaultSettings.bangs);

type BangTabPanelPropTypes = {
  options: Readonly<SettingsOptions>
  bangInfos: Readonly<ReactfulBangInfoContainer>
  setBangInfos: React.Dispatch<React.SetStateAction<ReactfulBangInfoContainer>>
  bangChangesToSave: boolean,
  updateSettings: (newOptions?: SettingsOptions, newBangInfos?: StoredBangInfo[]) => Promise<void>
};

export default function BangTabPanel(props: BangTabPanelPropTypes): React.ReactElement {
  const [bangInfoRows, setBangInfoRows] = useState<React.ReactElement[]>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const {
    options, bangInfos, setBangInfos, bangChangesToSave, updateSettings,
  } = props;

  // --- Top Buttons ---

  const saveBangInfo = () => {
    // Don't need to clone beacuse it's only read.
    updateSettings(undefined, reactfulBangInfoToStored(bangInfos));
  };

  const newBangInfo = () => {
    const newUrls = new Map();
    newUrls.set(nanoid(21), 'https://example.com/?q=%s');
    setBangInfos((oldBangInfos) => new Map(oldBangInfos).set(nanoid(21), { bang: 'e', urls: newUrls }));
    toast({
      title: 'New bang added to bottom of list',
      description: '',
      status: 'info',
      duration: 1500,
      isClosable: true,
      position: 'top',
    });
  };

  const importBangs = () => {
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const fileUpload = async (e: React.ChangeEvent<HTMLInputElement>):Promise<void> => {
    if (e.target.files === null) {
      return;
    }

    const file: File = e.target.files[0];

    if (fileInputRef.current !== null) {
      // Reset the selected file so that if the user imports the same file again,
      // the change event will still fire.
      fileInputRef.current.value = '';
    }

    let imported: BangsExport;
    try {
      imported = JSON.parse(await file.text());
    } catch (_e) {
      toast({
        title: 'Failed to import bangs',
        description: 'Could not parse invalid JSON.',
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (imported.version !== currentSettingsVersion) {
      toast({
        title: 'Failed to import bangs',
        description: `Found version: ${imported.version}, expecting version: ${currentSettingsVersion}.`,
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    let converted: ReactfulBangInfoContainer;
    try {
      converted = storedBangInfoToReactful(imported.bangs);
    } catch (_e) {
      toast({
        title: 'Failed to import bangs',
        description: 'Could not convert JSON to bangs type.',
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    converted = new Map([...bangInfos, ...converted]);
    setBangInfos(converted);

    toast({
      title: 'Successfully imported bangs',
      description: `Loaded from file: ${file.name}, don't forget to save!`,
      status: 'success',
      duration: 2500,
      isClosable: true,
      position: 'top',
    });
  };

  const importDdgBangs = () => {
    window.open('https://github.com/psidex/CustomBangSearch/tree/master/ddg', '_blank')?.focus();
  };

  const exportBangs = () => {
    const converted = reactfulBangInfoToStored(bangInfos);
    const exported: BangsExport = {
      version: currentSettingsVersion,
      bangs: converted,
    };
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exported))}`;
    // React probably doesn't like this 😬
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'custombangs.json');
    a.click(); // Blocks until user performs action.
    a.remove();
  };

  const resetBangsToDefault = () => {
    setBangInfos(defaultReactfulBangs);
  };

  // --- Buttons on individual bangs ---

  const removeBangInfo = useCallback((id: string) => {
    setBangInfos((oldBangInfos) => {
      const shallowCopy = new Map(oldBangInfos);
      // shallowCopy is a new map, removing from this wont affect the key/value in the state var.
      shallowCopy.delete(id);
      return shallowCopy;
    });
  }, [setBangInfos]);

  const generateRows = () => {
    const rows = [];
    const isLonely = bangInfos.size === 1;

    let sortedBangInfos: IterableIterator<[string, ReactfulBangInfo]>;

    if (options.sortByAlpha) {
      sortedBangInfos = Array.from(bangInfos.entries())
        .sort(([, bangInfoA], [, bangInfoB]) => bangInfoA.bang.localeCompare(bangInfoB.bang))
        .values();
    } else {
      sortedBangInfos = bangInfos.entries();
    }

    for (const [id, rowInfo] of sortedBangInfos) {
      rows.push(
        <BangInfo
          key={id}
          bangId={id}
          info={rowInfo}
          removeBangInfo={removeBangInfo}
          setBangInfos={setBangInfos}
          isLonely={isLonely}
        />,
      );
    }
    setBangInfoRows(rows);
  };

  useEffect(() => {
    generateRows();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bangInfos, options]);

  return (
    <TabPanel>
      <HStack paddingBottom="2em">
        <Button
          onClick={() => { saveBangInfo(); }}
          leftIcon={<CheckIcon />}
          colorScheme={bangChangesToSave ? 'whatsapp' : 'gray'}
          variant="solid"
        >
          Save
        </Button>
        <Button onClick={() => { newBangInfo(); }} leftIcon={<PlusSquareIcon />} variant="solid">Add Bang</Button>

        {/* Box because of this - https://github.com/chakra-ui/chakra-ui/issues/3440 */}
        <Box>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Import
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => { importBangs(); }}><Text fontSize="lg">Import bangs from file</Text></MenuItem>
              <MenuItem onClick={() => { importDdgBangs(); }}><Text fontSize="lg">Import DuckDuckGo bangs</Text></MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={fileUpload} />

        <Button onClick={() => { exportBangs(); }} leftIcon={<DownloadIcon />} variant="solid">Export</Button>
        <Button onClick={() => { resetBangsToDefault(); }} leftIcon={<RepeatIcon />} variant="solid">Reset To Default</Button>
        <RenderCounter />
      </HStack>
      <VStack align="left">
        {bangInfoRows}
      </VStack>
    </TabPanel>
  );
}
