// public/js/pages/daftarJadwal.js

// Asumsi createElement, createTable sudah tersedia secara global
function renderDaftarJadwal() {
    const cardContent = document.createDocumentFragment();

    const cardHeader = createElement('div', ['card-header']);
    cardHeader.appendChild(createElement('h2', [], 'Daftar Jadwal'));

    const cardBody = createElement('div', ['card-body']);
    const tableHeaders = ['No', 'Nim', 'Nama', 'Judul', 'Tanggal', 'Waktu', 'Konfirmasi'];
    const tableData = [
        ['1', '2178xxxxxx', 'andi', 'Lorem ipsum dolor sit amet.', '20/05/2023', '10.00 - 11.00 WIB',''],
        ['2', '2178xxxxxx', 'budi', 'Lorem ipsum dolor sit amet.', '22/05/2023', '13.00 - 14.00 WIB',''],
        ['3', '2178xxxxxx', 'cika', 'Lorem ipsum dolor sit amet.', '24/05/2023', '13.00 - 14.00 WIB',''],
    ];

    const jadwalTable = createTable(tableHeaders, tableData, (cellData, rowIndex, colIndex) => {
        if (colIndex === 6) { // Kolom 'Konfirmasi'
            const actionDiv = createElement('div', ['action-buttons']);
            const confirmBtn = createElement('button', ['btn-action', 'btn-confirm'], 'Konfirmasi');
            const cancelBtn = createElement('button', ['btn-action', 'btn-cancel'], 'Batal');
            actionDiv.append(confirmBtn, cancelBtn);
            return actionDiv;
        }
        return document.createTextNode(cellData);
    });
    cardBody.appendChild(jadwalTable);

    const cardFooter = createElement('div', ['card-footer']);
    const confirmAllBtn = createElement('button', ['btn-update'], 'Konfirmasi Semua');
    cardFooter.appendChild(confirmAllBtn);

    const card = createElement('div', ['card']);
    card.append(cardHeader, cardBody, cardFooter);
    return card;
}