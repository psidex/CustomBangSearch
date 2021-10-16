import React from 'react';
import { BangsType, SetBangsType } from '../../lib/bangs';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
  // Specific to this row:
  id: string
  bang: string
  url: string
}

export default function BangsTableRow(props: PropsType): React.ReactElement {
  const {
    bangs, setBangs, id, bang, url,
  } = props;

  // FIXME: When bang is changed it gets put at bottom of list for some reason.
  const bangChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newBang = e.target.value;

    if (newBang in bangs) {
      // TODO: Alert user they can't rename to a currently used bang.
      return;
    }

    const newBangs = { ...bangs };

    const oldObj = bangs[bang];

    delete newBangs[bang];
    newBangs[newBang] = oldObj;
    setBangs(newBangs);
  };

  const urlChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newBangs = { ...bangs };
    newBangs[bang] = { id, url: e.target.value };
    setBangs(newBangs);
  };

  const trashBtnlicked = (): void => {
    const newBangs = { ...bangs };
    delete newBangs[bang];
    setBangs(newBangs);
  };

  // TODO: Update CSS to support new usage of text inputs.
  return (
    <tr>
      <td><input type="text" value={bang} onChange={bangChanged} /></td>
      <td><input type="text" value={url} onChange={urlChanged} /></td>
      <td><button type="button" title="Trash" onClick={trashBtnlicked}>Trash</button></td>
    </tr>
  );
}
