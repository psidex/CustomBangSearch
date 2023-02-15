import React, { useEffect, useState } from 'react';

import {
  HStack, Input, TabPanel, Button, VStack,
} from '@chakra-ui/react';
import { DeleteIcon, PlusSquareIcon } from '@chakra-ui/icons';

import { nanoid } from 'nanoid';

import { ReactfulBangInfo, ReactfulBangInfoContainer, ReactfulUrlInfo } from './reactful';

type BangInfoPropTypes = {
  info: ReactfulBangInfo
};

function BangInfo(props: BangInfoPropTypes): React.ReactElement {
  const [bang, setBang] = useState<string>('');
  const [urls, setUrls] = useState<ReactfulUrlInfo>(new Map());
  const [urlInputs, setUrlInputs] = useState<React.ReactElement[]>([]);

  // TODO: Pass bang ID into this, then have update funciton that passes up to the
  // parent this ID along with the current bang and URLS.
  // The top level parent will need some sort of "bangsToSave" obj.

  // Only use the props as the initial state for this session.
  // The info prop should only ever change when "save" isclicked, which will cause a big
  // re-render but that's fine.
  const { info } = props;
  useEffect(() => {
    setBang(info.bang);
    setUrls(info.urls);
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
          <Button onClick={() => { deleteUrl(id); }} leftIcon={<DeleteIcon />} variant="outline" />
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
  const { bangInfos } = props;

  // TODO: Add new bang button (maybe in parent?), delete bang button.

  const rows = Object.entries(bangInfos).map(([id, info]) => <BangInfo key={id} info={info} />);

  // We want the render order to be the same every session no matter the changes, so we
  // sort based on the info.pos property which was added to store the exact order.
  rows.sort((x, y) => {
    if (x.props.info.pos > y.props.info.pos) {
      return 1;
    }
    return -1;
  });

  return (
    <TabPanel>
      {/* TODO: Buttons */}
      <VStack align="left">
        {rows}
      </VStack>
    </TabPanel>
  );
}
