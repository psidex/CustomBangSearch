import React, { useEffect, useState } from 'react';

import {
  HStack, Input, TabPanel, Button, VStack,
} from '@chakra-ui/react';
import { DeleteIcon, PlusSquareIcon } from '@chakra-ui/icons';

import { nanoid } from 'nanoid';

import { ReactfulBangInfo, ReactfulBangInfoContainer, ReactfulUrlInfo } from './reactful';

type BangInfoPropTypes = {
  propsId: string,
  info: ReactfulBangInfo
};

function BangInfo(props: BangInfoPropTypes): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bangId, setBangId] = useState<string>('');
  const [bang, setBang] = useState<string>('');
  const [urls, setUrls] = useState<ReactfulUrlInfo>(new Map());
  const [urlInputs, setUrlInputs] = useState<React.ReactElement[]>([]);

  // The top level parent will need some sort of "bangsToSave" obj that is not used to
  // render, is just used to keep track of the new state so when we want to save, it's
  // then easy to save as we already have one obj that is all up to date.
  //
  // TODO: Pass in update func so that when something changes, we can pass up this ID
  // along with the current bang and URLS, to be saved in the future.

  // Only use the props as the initial state for this session.
  // The info prop should only ever change when "save" isclicked, which will cause a big
  // re-render but that's fine.
  const { propsId, info } = props;
  useEffect(() => {
    setBang(info.bang);
    setUrls(info.urls);
    setBangId(propsId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bangChanged = (e: any) => { setBang(e.target.value); };

  const urlChanged = (e: any, id: string) => {
    // https://stackoverflow.com/a/62455456/6396652
    setUrls(new Map(urls.set(id, e.target.value)));
  };
  const deleteUrl = (id: string) => {
    const shallowCopy = new Map(urls);
    shallowCopy.delete(id);
    setUrls(shallowCopy);
  };
  const addUrl = () => {
    setUrls(new Map(urls.set(nanoid(21), 'https://example.com/?q=%s')));
  };

  useEffect(() => {
    const inputs = [];
    for (const urlInfo of urls) {
      const id = urlInfo[0];
      const url = urlInfo[1];
      inputs.push(
        <HStack key={id}>
          <Input
            value={url}
            onChange={(e: any) => { urlChanged(e, id); }}
            placeholder="https://example.com/?q=%s"
            width="30em"
          />
          <Button onClick={() => { deleteUrl(id); }} leftIcon={<DeleteIcon />} iconSpacing={0} variant="outline" />
        </HStack>,
      );
    }
    setUrlInputs(inputs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls]);

  return (
    <HStack align="top">
      <Input value={bang} onChange={bangChanged} placeholder="bang" width="6em" />
      <VStack align="left">
        {urlInputs}
      </VStack>
      <Button onClick={addUrl} alignSelf="end" leftIcon={<PlusSquareIcon />} variant="outline">Add URL</Button>
    </HStack>
  );
}

type BangTabPanelPropTypes = {
  bangInfos: Readonly<ReactfulBangInfoContainer>
};

export default function BangTabPanel(props: BangTabPanelPropTypes): React.ReactElement {
  const [bangInfoRows, setBangInfoRows] = useState<React.ReactElement[]>();

  const { bangInfos } = props;
  useEffect(() => {
    const rows = [];
    for (const info of bangInfos) {
      const id = info[0];
      const rowInfo = info[1];
      rows.push(
        <BangInfo key={id} propsId={id} info={rowInfo} />,
      );
    }
    setBangInfoRows(rows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TabPanel>
      {/* TODO: Add new bang button (maybe in parent?), delete bang button */}
      <VStack align="left">
        {bangInfoRows}
      </VStack>
    </TabPanel>
  );
}
