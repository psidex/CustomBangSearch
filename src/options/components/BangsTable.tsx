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

  // We want the render order to be the same every time no matter the changes, so we
  // sort based on the array key which is also the bang ID.
  // FIXME: The only downside to this is that new bangs will be randomly placed.
  // TODO: Maybe store the order and use that instead of sorting on ID.
  rows.sort((x, y) => {
    if (x.key === null || y.key === null) {
      return 0;
    }
    if (x.key > y.key) {
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
