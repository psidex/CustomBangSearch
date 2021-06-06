// Options that can/may need to be changed in the future.
const optSaveBtnHighlightBgColour = 'darkblue';
const optEmptyCellBgColour = '#FF6961';
const optDefaultJsonFilePath = '../defaults.json';
const optExportFileName = 'custombangs.json';
const optHelpUrl = 'https://github.com/psidex/CustomBangSearch#options-page';

// This script is loaded using the `defer` attribute so the DOM is guaranteed to be parsed.
const elemBangsTable = document.getElementById('bangsTable');
const elemImportFileInput = document.getElementById('importFileInput');
const elemSaveBtn = document.getElementById('saveBtn');
const elemAddRowBtn = document.getElementById('addRowBtn');
const elemImportBtn = document.getElementById('importBtn');
const elemExportBtn = document.getElementById('exportBtn');
const elemSetDefaultBtn = document.getElementById('setDefaultBtn');
const elemHelpBtn = document.getElementById('helpBtn');
const elemErrorToast = document.getElementById('errorToast');

// Makes calls to setSaveBtnHighlight easier to read.
const ON = true;
const OFF = false;

// Highlights the save button to show something has changed and needs saving.
function setSaveBtnHighlight(onOff) {
    if (onOff === ON) {
        elemSaveBtn.style.backgroundColor = optSaveBtnHighlightBgColour;
    } else {
        elemSaveBtn.style.backgroundColor = '';
    }
}

// Is called whenever a cell is edited, performs conditional highlights and save btn highlights.
function onCellEdit(e) {
    if (e.target.textContent === '') {
        e.target.style.backgroundColor = optEmptyCellBgColour;
    } else {
        e.target.style.backgroundColor = '';
    }
    setSaveBtnHighlight(ON);
}

// Event handler for the row delete button.
function deleteRowClicked(e) {
    // The target will be the img, the first parent a td and the second the row.
    e.target.parentElement.parentElement.remove();
    setSaveBtnHighlight(ON);
}

// Adds a row to the bangs table with the given texts and a trash icon.
function addRow(bangText, urlText) {
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
    trashImg.addEventListener('click', deleteRowClicked);
    trashImg.setAttribute('src', 'trash.svg');
    trashImg.setAttribute('class', 'trashSvg');
    trashImgTd.appendChild(trashImg);
    row.appendChild(trashImgTd);

    elemBangsTable.appendChild(row);
    setSaveBtnHighlight(ON);
}

// Remove all <td> from the table & add new ones from either bangsToUse or browser storage.
async function renderTable(bangsToUse = null) {
    // Set to a const as elemBangsTable.rows.length will change as we remove things.
    const lastRowIndex = elemBangsTable.rows.length - 1;
    // Counting down from the last index means we don't have to worry about the fact that the amount
    // of rows is changing when we remove one. i > 0 means that we will stop before removing the 0th
    // element, the header row.
    for (let i = lastRowIndex; i > 0; i--) {
        elemBangsTable.rows[i].remove();
    }

    let bangs = bangsToUse;
    if (bangs === null) {
        bangs = (await browser.storage.sync.get('bangs')).bangs;
    }

    for (const [k, v] of Object.entries(bangs)) {
        addRow(k, v);
    }
}

// Takes the rows in the table and saves the given parameters to storage.
async function saveFromTable() {
    const bangs = {};

    // Starting from 1 ignores the headers.
    for (let i = 1; i < elemBangsTable.rows.length; i++) {
        const row = elemBangsTable.rows[i];

        const bangText = row.cells[0].textContent.trim();
        const urlText = row.cells[1].textContent.trim();

        if (bangText !== '' && urlText !== '') {
            bangs[bangText] = urlText;
        } else {
            row.remove();
        }
    }

    await browser.storage.sync.set({ bangs });
    // Re-rendering will visually remove duplicate bangs.
    await renderTable(bangs);
    setSaveBtnHighlight(OFF);
}

// Attempts to load a valid & importable JSON object from the file, otherwise returns null.
async function tryFileToObj(file) {
    if (file.type !== 'application/json') {
        return null;
    }

    let obj = {};
    try {
        obj = JSON.parse(await file.text());
    } catch (e) {
        return null;
    }

    for (const [key, value] of Object.entries(obj)) {
        if (typeof key !== 'string' || typeof value !== 'string') {
            return null;
        }
    }

    return obj;
}

// Imports bangs from a given file by appending them to the current bangs.
async function importBangs() {
    const file = elemImportFileInput.files[0];
    const newBangs = await tryFileToObj(file);

    if (newBangs !== null) {
        const { bangs: currentBangs } = await browser.storage.sync.get('bangs');
        const combined = { ...currentBangs, ...newBangs };
        await renderTable(combined);
    } else {
        // Show then hide error toast, timeout ms should be the same as the time in the CSS.
        elemErrorToast.setAttribute('class', 'show');
        setTimeout(
            () => { elemErrorToast.setAttribute('class', ''); },
            4000,
        );
    }
}

// Exports the currently saved bangs (not the bangs currently in the table).
async function exportBangs() {
    const { bangs } = await browser.storage.sync.get('bangs');
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bangs))}`;
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', optExportFileName);
    a.click();
    a.remove();
}

// Sets the storage to the defaults and re-renders the table.
async function setDefaults() {
    const r = await fetch(optDefaultJsonFilePath);
    const bangs = await r.json();
    await renderTable(bangs);
}

// Sets up event listeners and calls renderTable.
document.addEventListener('DOMContentLoaded', async () => {
    elemSaveBtn.addEventListener('click', async () => {
        await saveFromTable();
    });
    elemAddRowBtn.addEventListener('click', () => {
        addRow('e', 'https://example.com?q=%s');
    });
    elemImportBtn.addEventListener('click', () => {
        elemImportFileInput.click();
    });
    elemImportFileInput.addEventListener('change', async () => {
        await importBangs();
    });
    elemExportBtn.addEventListener('click', async () => {
        await exportBangs();
    });
    elemSetDefaultBtn.addEventListener('click', async () => {
        await setDefaults();
    });
    elemHelpBtn.addEventListener('click', async () => {
        window.open(optHelpUrl);
    });

    // It is assumed bangs wont ever be undefined here as we set it in main.js.
    await renderTable();
    // renderTable will cause the save button to highlight.
    // We're rendering what is already saved so don't do that.
    setSaveBtnHighlight(OFF);
});
