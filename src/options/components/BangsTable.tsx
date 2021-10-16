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
      id={bangObj.id}
      bang={bang}
      url={bangObj.url}
    />);
  }

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
