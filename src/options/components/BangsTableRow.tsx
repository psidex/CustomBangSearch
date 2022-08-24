import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BangInfoType, BangsType, SetBangsType } from '../../lib/bangs';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
  setUnsavedChanges: () => void
  setBangError: (error: boolean) => void
  // Specific to this row:
  bang: string
  bangInfo: BangInfoType
}

export default function BangsTableRow(props: PropsType): React.ReactElement {
  const {
    bangs, setBangs, setUnsavedChanges, bang, bangInfo, setBangError,
  } = props;
  const [bangCss, setBangCss] = useState<object>({});
  const [internalBangValue, setInternalBangValue] = useState(bang);
  const [internalUrlValue, setInternalUrlValue] = useState(bangInfo.url);

  // keep track of external changes, e.g. when resetting bangs to default values
  useEffect(() => {
    setInternalBangValue(bang);
    setInternalUrlValue(bangInfo.url);
  }, [bang, bangInfo]);

  const bangLostFocus = (): void => {
    const newBang = internalBangValue.trim();

    if ((newBang in bangs && newBang !== bang) || newBang === '') {
      setBangCss({ backgroundColor: 'red' });
      setBangError(true);
    } else {
      setBangCss({});
      setBangError(false);
    }

    if (newBang === bang) {
      // no changes
      return;
    }

    if (newBang in bangs) {
      toast.error('Can\'t rename bang to a currently used bang');
      return;
    }

    const newBangs = { ...bangs };

    const oldObj = bangs[bang];

    delete newBangs[bang];
    newBangs[newBang] = oldObj;
    setBangs(newBangs);
    setUnsavedChanges();
  };

  const urlLostFocus = (): void => {
    const newBangs = { ...bangs };
    newBangs[bang] = { id: bangInfo.id, url: internalUrlValue, pos: bangInfo.pos };
    setBangs(newBangs);
    setUnsavedChanges();
  };

  const trashBtnlicked = (): void => {
    const newBangs: BangsType = {};

    const bangsWithRemoved = { ...bangs };
    delete bangsWithRemoved[bang];

    // pos-1 for every pos above deleted's pos
    for (const [bangName, bangObj] of Object.entries(bangsWithRemoved)) {
      newBangs[bangName] = {
        id: bangObj.id,
        url: bangObj.url,
        pos: bangObj.pos > bangInfo.pos ? bangObj.pos - 1 : bangObj.pos,
      };
    }

    setBangs(newBangs);
    setUnsavedChanges();
  };

  return (
    <tr>
      <td>
        <input
          type="text"
          value={internalBangValue}
          onChange={(evt): void => setInternalBangValue(evt.target.value)}
          onBlur={bangLostFocus}
          style={bangCss}
        />
      </td>
      <td>
        <input
          type="text"
          value={internalUrlValue}
          onChange={(evt): void => setInternalUrlValue(evt.target.value)}
          onBlur={urlLostFocus}
        />
      </td>
      <td><button type="button" title="Trash" onClick={trashBtnlicked}>🗑</button></td>
    </tr>
  );
}
