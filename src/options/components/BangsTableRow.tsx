import React from 'react';
import toast from 'react-hot-toast';
import { BangInfoType, BangsType, SetBangsType } from '../../lib/bangs';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>
  // Specific to this row:
  bang: string
  bangInfo: BangInfoType
}

export default function BangsTableRow(props: PropsType): React.ReactElement {
  const {
    bangs, setBangs, setUnsavedChanges, bang, bangInfo,
  } = props;

  const bangChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newBang = e.target.value.trim();

    if (newBang in bangs || newBang === '') {
      toast.error('Can\'t rename bang to a currently used bang or nothing');
      return;
    }

    const newBangs = { ...bangs };

    const oldObj = bangs[bang];

    delete newBangs[bang];
    newBangs[newBang] = oldObj;
    setBangs(newBangs);
    setUnsavedChanges(true);
  };

  const urlChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newBangs = { ...bangs };
    newBangs[bang] = { id: bangInfo.id, url: e.target.value, pos: bangInfo.pos };
    setBangs(newBangs);
    setUnsavedChanges(true);
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
    setUnsavedChanges(true);
  };

  return (
    <tr>
      <td><input type="text" value={bang} onChange={bangChanged} /></td>
      <td><input type="text" value={bangInfo.url} onChange={urlChanged} /></td>
      <td><button type="button" title="Trash" onClick={trashBtnlicked}>🗑</button></td>
    </tr>
  );
}
