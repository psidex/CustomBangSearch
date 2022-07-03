import React, { useState } from 'react';
import { BangsType, SetBangsType } from '../../lib/bangs';
import BangsTableRow from './BangsTableRow';

interface PropsType {
  bangs: BangsType
  setBangs: SetBangsType
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>
}

export default function BangsTable(props: PropsType): React.ReactElement {
  const {
    bangs, setBangs, setUnsavedChanges,
  } = props;

  const rows = [];
  const [bangErrors, setBangErrors] = useState<string[]>([]);
  const [unsavedInternalChanges, setUnsavedInternalChanges] = useState(false);

  for (const [bang, bangObj] of Object.entries(bangs)) {
    rows.push(<BangsTableRow
      key={bangObj.id}
      bangs={bangs}
      setBangs={setBangs}
      bangInfo={bangObj}
      bang={bang}
      setUnsavedChanges={(): void => {
        setUnsavedInternalChanges(true);

        if (bangErrors.length === 0) {
          setUnsavedChanges(true);
          setUnsavedInternalChanges(false);
        }
      }}
      setBangError={(error): void => {
        if (error && !bangErrors.includes(bang)) {
          const newBangErrors = [...bangErrors, bang];

          setBangErrors(newBangErrors);

          if (newBangErrors.length === 1) {
            setUnsavedChanges(false);
          }
        } else if (!error && bangErrors.includes(bang)) {
          const newBangErrors = bangErrors.filter((be) => be !== bang);

          setBangErrors(newBangErrors);

          if (newBangErrors.length === 0 && unsavedInternalChanges) {
            setUnsavedChanges(true);
            setUnsavedInternalChanges(false);
          }
        }
      }}
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
