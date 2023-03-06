import React, { useEffect, useRef, useState } from 'react';

import {
  Button, HStack, TabPanel, useToast, VStack,
} from '@chakra-ui/react';
import {
  CheckIcon, PlusSquareIcon, RepeatIcon, DownloadIcon, LinkIcon,
} from '@chakra-ui/icons';

import { nanoid } from 'nanoid';

import {
  ReactfulBangInfo, ReactfulBangInfoContainer, reactfulBangInfoToStored, storedBangInfoToReactful,
} from '../reactful';
import BangInfo from './BangInfo';
import { SettingsOptions, StoredBangInfo } from '../../lib/settings';
import defaultSettings from '../../lib/settings.default.json';

const defaultReactfulBangs = storedBangInfoToReactful(defaultSettings.bangs);

type BangTabPanelPropTypes = {
  bangInfos: Readonly<ReactfulBangInfoContainer>
  setBangInfos: React.Dispatch<React.SetStateAction<ReactfulBangInfoContainer>>
  updateSettings: (newOptions?: SettingsOptions, newBangInfos?: StoredBangInfo[]) => Promise<void>
};

export default function BangTabPanel(props: BangTabPanelPropTypes): React.ReactElement {
  const [bangInfoRows, setBangInfoRows] = useState<React.ReactElement[]>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const { bangInfos, setBangInfos, updateSettings } = props;

  // --- Top Buttons ---

  const saveBangInfo = () => {
    // Don't need to clone beacuse it's only read.
    updateSettings(undefined, reactfulBangInfoToStored(bangInfos));
  };

  const newBangInfo = () => {
    const newUrls = new Map();
    newUrls.set(nanoid(21), 'https://example.com/?q=%s');
    setBangInfos((oldBangInfos) => new Map(oldBangInfos).set(nanoid(21), {
      bang: 'e',
      urls: newUrls,
    }));
  };

  const importBangs = () => {
    // FIXME: This doesn't quite work properly; because we watch for "change" events,
    // if the file the user has selected doesn't change (but they want to import it
    // again, by opening and clicking on it) then this won't run.
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const fileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files === null) {
      return;
    }

    const file: File = e.target.files[0];

    let newBangs: StoredBangInfo[];
    try {
      newBangs = JSON.parse(await file.text());
    } catch (_e) {
      toast({
        title: 'Failed to import bangs',
        description: 'Could not parse invalid JSON.',
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    let converted;
    try {
      converted = storedBangInfoToReactful(newBangs);
    } catch (_e) {
      toast({
        title: 'Failed to import bangs',
        description: 'Could not convert JSON to bangs type.',
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setBangInfos(converted);
    toast({
      title: 'Successfully imported bangs',
      description: `Loaded from file: ${file.name}, don't forget to save!`,
      status: 'success',
      duration: 7000,
      isClosable: true,
      position: 'top',
    });
  };

  const exportBangs = () => {
    const toDownload = reactfulBangInfoToStored(bangInfos);
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(toDownload))}`;
    // React probably doesn't like this 😬
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'custombangs.json');
    a.click(); // Blocks until user performs action.
    a.remove();
  };

  const resetBangsToDefeault = () => {
    setBangInfos(defaultReactfulBangs);
  };

  // --- Buttons on individual bangs ---

  const removeBangInfo = (id: string) => {
    setBangInfos((oldBangInfos) => {
      const shallowCopy = new Map(oldBangInfos);
      // shallowCopy is a new map, removing from this wont affect the key/value in the state var.
      shallowCopy.delete(id);
      return shallowCopy;
    });
  };

  const updateBangInfo = (id: string, info: ReactfulBangInfo) => {
    // Shallow copy then update with entirely new value at given id, no mutation happens.
    setBangInfos((oldBangInfos) => new Map(oldBangInfos).set(id, info));
  };

  const generateRows = () => {
    const rows = [];
    for (const info of bangInfos) {
      const id = info[0];
      const rowInfo = info[1];
      rows.push(
        <BangInfo
          key={id}
          bangId={id}
          info={rowInfo}
          removeBangInfo={removeBangInfo}
          updateBangInfo={updateBangInfo}
        />,
      );
    }
    setBangInfoRows(rows);
  };

  useEffect(() => {
    generateRows();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bangInfos]);

  return (
    <TabPanel>
      <HStack paddingBottom="2em">
        <Button onClick={() => { saveBangInfo(); }} leftIcon={<CheckIcon />} variant="outline">Save</Button>
        <Button onClick={() => { newBangInfo(); }} leftIcon={<PlusSquareIcon />} variant="outline">Add Bang</Button>
        <Button onClick={() => { importBangs(); }} leftIcon={<LinkIcon />} variant="outline">Import</Button>
        <input
          ref={fileInputRef}
          id="importFileInput"
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={fileUpload}
        />
        <Button onClick={() => { exportBangs(); }} leftIcon={<DownloadIcon />} variant="outline">Export</Button>
        <Button onClick={() => { resetBangsToDefeault(); }} leftIcon={<RepeatIcon />} variant="outline">Reset To Default</Button>
      </HStack>
      <VStack align="left">
        {bangInfoRows}
      </VStack>
    </TabPanel>
  );
}
