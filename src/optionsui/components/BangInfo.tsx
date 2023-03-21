import React, { useEffect, useState } from 'react';

import { HStack, Button, VStack } from '@chakra-ui/react';
import { DeleteIcon, PlusSquareIcon } from '@chakra-ui/icons';

import { nanoid } from 'nanoid';

import ControlledInput from './ControlledInput';
import { ReactfulBangInfo, ReactfulBangInfoContainer } from '../reactful';

type BangInfoPropTypes = {
  bangId: string,
  info: ReactfulBangInfo,
  removeBangInfo: (id: string) => void,
  setBangInfos: React.Dispatch<React.SetStateAction<ReactfulBangInfoContainer>>,
  isLonely: boolean
};

export default function BangInfo(props: BangInfoPropTypes): React.ReactElement {
  const [urlInputs, setUrlInputs] = useState<React.ReactElement[]>([]);

  const {
    bangId, info, removeBangInfo, setBangInfos, isLonely,
  } = props;

  const bangChanged = (e: any) => {
    setBangInfos((oldBangInfos: ReactfulBangInfoContainer): ReactfulBangInfoContainer => {
      const old = oldBangInfos.get(bangId);
      if (old === undefined) {
        return oldBangInfos;
      }
      const infoCopy: ReactfulBangInfo = { ...old };
      infoCopy.bang = e.target.value;
      return new Map(oldBangInfos).set(bangId, infoCopy);
    });
  };

  const urlChanged = (e: any, id: string) => {
    setBangInfos((oldBangInfos: ReactfulBangInfoContainer): ReactfulBangInfoContainer => {
      const old = oldBangInfos.get(bangId);
      if (old === undefined) {
        return oldBangInfos;
      }
      const infoCopy: ReactfulBangInfo = { ...old };
      infoCopy.urls = new Map(info.urls).set(id, e.target.value);
      return new Map(oldBangInfos).set(bangId, infoCopy);
    });
  };
  const deleteUrl = (id: string) => {
    setBangInfos((oldBangInfos: ReactfulBangInfoContainer): ReactfulBangInfoContainer => {
      const old = oldBangInfos.get(bangId);
      if (old === undefined) {
        return oldBangInfos;
      }
      const infoCopy: ReactfulBangInfo = { ...old };
      const urlsCopy = new Map(infoCopy.urls);
      urlsCopy.delete(id);
      infoCopy.urls = urlsCopy;
      return new Map(oldBangInfos).set(bangId, infoCopy);
    });
  };
  const addUrl = () => {
    setBangInfos((oldBangInfos: ReactfulBangInfoContainer): ReactfulBangInfoContainer => {
      const old = oldBangInfos.get(bangId);
      if (old === undefined) {
        return oldBangInfos;
      }
      const infoCopy: ReactfulBangInfo = { ...old };
      infoCopy.urls = new Map(info.urls).set(nanoid(21), 'https://example.com/?q=%s');
      return new Map(oldBangInfos).set(bangId, infoCopy);
    });
  };

  useEffect(() => {
    const inputs = [];
    for (const urlInfo of info.urls) {
      const urlId = urlInfo[0];
      const url = urlInfo[1];
      inputs.push(
        <HStack key={urlId}>
          <ControlledInput
            value={url}
            onChange={(e: any) => { urlChanged(e, urlId); }}
            placeholder="https://example.com/?q=%s"
            width="30em"
          />
          {info.urls.size > 1
            && (
            <Button title="Remove this URL" onClick={() => { deleteUrl(urlId); }} variant="ghost">
              <DeleteIcon />
            </Button>
            )}
        </HStack>,
      );
    }
    setUrlInputs(inputs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.urls]);

  return (
    <HStack align="top" paddingBottom="1em">
      {!isLonely
      && (
      <Button title="Remove this bang" onClick={() => { removeBangInfo(bangId); }} variant="ghost">
        <DeleteIcon />
      </Button>
      )}
      <ControlledInput value={info.bang} onChange={bangChanged} placeholder="bang" width="6em" />
      <VStack align="left">
        {urlInputs}
      </VStack>
      <Button onClick={addUrl} alignSelf="end" variant="ghost" title="Add URL to this bang">
        <PlusSquareIcon />
      </Button>
    </HStack>
  );
}
