import React, { useEffect, useState } from 'react';

import {
  Button, HStack, TabPanel, VStack,
} from '@chakra-ui/react';
import { CheckIcon, PlusSquareIcon } from '@chakra-ui/icons';

import { nanoid } from 'nanoid';

import { ReactfulBangInfo, ReactfulBangInfoContainer, reactfulBangInfoToStored } from '../reactful';
import BangInfo from './BangInfo';

type BangTabPanelPropTypes = {
  bangInfos: Readonly<ReactfulBangInfoContainer>
  setBangInfos: React.Dispatch<React.SetStateAction<ReactfulBangInfoContainer>>
  updateSettings: Function // FIXME
};

export default function BangTabPanel(props: BangTabPanelPropTypes): React.ReactElement {
  const [bangInfoRows, setBangInfoRows] = useState<React.ReactElement[]>();

  const { bangInfos, setBangInfos, updateSettings } = props;

  const saveBangInfo = () => {
    // Don't need to clone beacuse it's only read.
    updateSettings(undefined, reactfulBangInfoToStored(bangInfos));
  };

  const updateBangInfo = (id: string, info: ReactfulBangInfo) => {
    // Shallow copy then update with entirely new value at given id, no mutation happens.
    setBangInfos((oldBangInfos) => new Map(oldBangInfos).set(id, info));
  };

  const newBangInfo = () => {
    const newUrls = new Map();
    newUrls.set(nanoid(21), 'https://example.com/?q=%s');
    setBangInfos((oldBangInfos) => new Map(oldBangInfos).set(nanoid(21), {
      bang: 'e',
      urls: newUrls,
    }));
  };

  const removeBangInfo = (id: string) => {
    setBangInfos((oldBangInfos) => {
      const shallowCopy = new Map(oldBangInfos);
      // shallowCopy is a new map, removing from this wont affect the key/value in the state var.
      shallowCopy.delete(id);
      return shallowCopy;
    });
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
      </HStack>
      <VStack align="left">
        {bangInfoRows}
      </VStack>
    </TabPanel>
  );
}