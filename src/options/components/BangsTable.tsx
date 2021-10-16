import React from 'react';
import { BangsType, SetBangsType } from '../../lib/bangs';
import BangsTableRow from './BangsTableRow';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
}

export default function BangsTable(props: PropsType): React.ReactElement {
  const { bangs, setBangs } = props;

  const rows = [];

  for (const [bang, bangObj] of Object.entries(bangs)) {
    rows.push(<BangsTableRow
      key={bangObj.id}
      bangs={bangs}
      setBangs={setBangs}
      bangInfo={bangObj}
      bang={bang}
    />);
  }

  // We want the render order to be the same every time no matter the changes, so we
  // sort based on the bangInfo.pos property which was added to store the exact order.
  rows.sort((x, y) => {
    if (x.props.bangInfo.pos > y.props.bangInfo.pos) {
      return 1;
    }
    return -1;
  });

  return (
    <table>
      <tr>
        <th>Bang</th>
        <th>Url</th>
        <th aria-label="Remove Bang Button" />
      </tr>
      {rows}
    </table>
  );
}
