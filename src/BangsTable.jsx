import React from 'react';

export default function BangsTable(props) {
  const { bangs, setBangs, setUnsaved } = props;
  const rows = [];

  const removeBang = (id) => {
    const bangsClone = { ...bangs };
    delete bangsClone[id];
    setBangs(bangsClone);
    setUnsaved(true);
  };

  const bangChanged = (id, newBang) => {
    console.log(`bangChanged = (${id}, ${newBang})`);
    const { url } = bangs[id];
    const bangsClone = { ...bangs };
    bangsClone[id] = { bang: newBang, url };
    setBangs(bangsClone);
    setUnsaved(true);
  };

  const urlChanged = (id, newUrl) => {
    const { bang } = bangs[id];
    const bangsClone = { ...bangs };
    bangsClone[id] = { bang, url: newUrl };
    setBangs(bangsClone);
    setUnsaved(true);
  };

  for (const [id, { bang, url }] of Object.entries(bangs)) {
    rows.push(
      <tr key={id}>
        <td className="bangInputCol">
          <input
            type="text"
            value={bang}
            onChange={(e) => { bangChanged(id, e.target.value); }}
          />
        </td>
        <td className="urlInputCol">
          <input
            type="text"
            value={url}
            onChange={(e) => { urlChanged(id, e.target.value); }}
          />
        </td>
        <td className="trashBtnCol">
          <button
            type="button"
            className="trashBtn"
            title="Remove this bang"
            onClick={() => { removeBang(id); }}
          >
            <img src="trash.svg" className="trashSvg" alt="Trash icon" />
          </button>
        </td>
      </tr>,
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th aria-label="Bang">Bang</th>
          <th aria-label="URL">URLs</th>
          <th aria-label="Remove Button" />
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
}
