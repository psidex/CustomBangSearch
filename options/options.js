// ToDo: Is it possible to do imports in add-ons so that this isn't duplicate code?
const defaultBangs = {
    a: 'https://smile.amazon.co.uk/s?k=',
    m: 'https://www.google.com/maps/search/',
    t: 'https://www.twitch.tv/search?term=',
    y: 'https://www.youtube.com/results?search_query=',
    g: 'https://www.google.com/search?q=',
    w: 'https://www.wolframalpha.com/input/?i=',
};

// true if object has no keys else false.
function isEmptyObj(obj) {
    return Object.keys(obj).length === 0;
}

function addRow(tableElem, c1Text, c2Text) {
    const row = document.createElement('tr');
    const c1 = document.createElement('td');
    const c2 = document.createElement('td');
    c1.textContent = c1Text;
    c2.textContent = c2Text;
    row.appendChild(c1);
    row.appendChild(c2);
    row.setAttribute('contenteditable', true);
    tableElem.appendChild(row);
}

function save(table) {
    const bangs = {};

    // Start from 1 to ignore headers.
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];

        let c1Text = row.cells[0].textContent.trim();
        let c2Text = row.cells[1].textContent.trim();

        if (c1Text !== '' && c2Text !== '') {
            // ToDo: Only set if c2Text is a valid URL.
            bangs[c1Text] = c2Text;
        } else if (c1Text === '' && c2Text === '') {
            // ToDo: Remove this row.
        }
    }

    browser.storage.sync.set({'bangs': bangs});
}

document.addEventListener('DOMContentLoaded', async () => {
    const table = document.querySelector('#bangsTable');

    document.querySelector('#addRowBtn').addEventListener('click', () => {
        addRow(table, 'e', 'example.com?q=');
        save(table);
    });

    document.querySelector('#saveBtn').addEventListener('click', () => {
        save(table);
    });

    let { bangs } = await browser.storage.sync.get('bangs');
    if (isEmptyObj(bangs)) {
        bangs = defaultBangs;
    }

    for (const [k, v] of Object.entries(bangs)) {
        addRow(table, k, v);
    }
});
