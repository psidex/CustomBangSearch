function onCellEdit(e) {
    if (e.target.textContent === '') {
        e.target.style.backgroundColor = '#FF6961';
    } else {
        e.target.style.backgroundColor = '';
    }
}

function deleteRowClicked(e) {
    e.target.parentElement.parentElement.remove();
}

function addRow(tableElem, bangText, urlText) {
    const row = document.createElement('tr');

    const bangCol = document.createElement('td');
    bangCol.textContent = bangText;
    bangCol.addEventListener('input', onCellEdit);
    bangCol.setAttribute('contenteditable', 'true');
    row.appendChild(bangCol);

    const urlCol = document.createElement('td');
    urlCol.textContent = urlText;
    urlCol.addEventListener('input', onCellEdit);
    urlCol.setAttribute('contenteditable', 'true');
    row.appendChild(urlCol);

    const trashImgTd = document.createElement('td');
    const trashImg = document.createElement('img');
    trashImg.src = 'trash.svg';
    trashImg.className = 'trashBinSvg';
    trashImg.addEventListener('click', deleteRowClicked);
    trashImgTd.appendChild(trashImg);
    row.appendChild(trashImgTd);

    tableElem.appendChild(row);
}

async function save(table) {
    const bangs = {};

    // Start from 1 to ignore headers.
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];

        const bangText = row.cells[0].textContent.trim();
        const urlText = row.cells[1].textContent.trim();

        if (bangText !== '' && urlText !== '') {
            bangs[bangText] = urlText;
        } else {
            row.remove();
        }
    }

    await browser.storage.sync.set({ bangs });
}

document.addEventListener('DOMContentLoaded', async () => {
    const table = document.querySelector('#bangsTable');

    document.querySelector('#addRowBtn').addEventListener('click', async () => {
        addRow(table, 'e', 'https://example.com?q=%s');
    });

    document.querySelector('#saveBtn').addEventListener('click', async () => {
        await save(table);
    });

    // It is assumed bangs != undefined as we set it in main.js.
    const { bangs } = await browser.storage.sync.get('bangs');
    for (const [k, v] of Object.entries(bangs)) {
        addRow(table, k, v);
    }
});
