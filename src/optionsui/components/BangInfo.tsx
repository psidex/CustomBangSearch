import React, { useEffect, useRef, useState } from 'react';

import {
  HStack, Input, Button, VStack, Text,
} from '@chakra-ui/react';
import { DeleteIcon, PlusSquareIcon } from '@chakra-ui/icons';

import { nanoid } from 'nanoid';

import { ReactfulBangInfo } from '../reactful';

type BangInfoPropTypes = {
  bangId: string,
  info: ReactfulBangInfo,
  removeBangInfo: (id: string) => void,
  updateBangInfo: (id: string, info: ReactfulBangInfo) => void
};

export default function BangInfo(props: BangInfoPropTypes): React.ReactElement {
  // Temporary for debugging.
  const renderCounter = useRef(0);
  renderCounter.current += 1;

  const [urlInputs, setUrlInputs] = useState<React.ReactElement[]>([]);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bangId, info, removeBangInfo, updateBangInfo,
  } = props;

  const bangChanged = (e: any) => {
    const infoCopy = { ...info };
    infoCopy.bang = e.target.value;
    // In all of these change handlers we want to make a deep copy of the URLs whether
    // they change or not, as it's state and the obj spread is a shallow copy.
    // See comment in updateBangInfo for more of an explanation.
    // BUT since this is nested it might not matter as much?
    // TODO: More research on this.
    infoCopy.urls = new Map(info.urls);
    updateBangInfo(bangId, infoCopy);
  };

  const urlChanged = (e: any, id: string) => {
    const infoCopy = { ...info };
    infoCopy.urls = new Map(info.urls.set(id, e.target.value));
    updateBangInfo(bangId, infoCopy);
  };
  const deleteUrl = (id: string) => {
    const urlsCopy = new Map(info.urls);
    urlsCopy.delete(id);

    const infoCopy = { ...info };
    infoCopy.urls = urlsCopy;
    updateBangInfo(bangId, infoCopy);
  };
  const addUrl = () => {
    const infoCopy = { ...info };
    infoCopy.urls = new Map(info.urls.set(nanoid(21), 'https://example.com/?q=%s'));
    updateBangInfo(bangId, infoCopy);
  };

  useEffect(() => {
    const inputs = [];
    for (const urlInfo of info.urls) {
      const urlId = urlInfo[0];
      const url = urlInfo[1];
      inputs.push(
        <HStack key={urlId}>
          <Input
            value={url}
            onChange={(e: any) => { urlChanged(e, urlId); }}
            placeholder="https://example.com/?q=%s"
            width="30em"
          />
          <Button onClick={() => { deleteUrl(urlId); }} variant="outline"><DeleteIcon /></Button>
        </HStack>,
      );
    }
    setUrlInputs(inputs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.urls]);

  return (
    <HStack align="top" paddingBottom="1em">
      <Button onClick={() => { removeBangInfo(bangId); }} variant="outline"><DeleteIcon /></Button>
      <Input value={info.bang} onChange={bangChanged} placeholder="bang" width="6em" />
      <VStack align="left">
        {urlInputs}
      </VStack>
      <Button onClick={addUrl} alignSelf="end" leftIcon={<PlusSquareIcon />} variant="outline">Add URL</Button>
      <Text>
        {`Renders: ${renderCounter.current}`}
      </Text>
    </HStack>
  );
}
