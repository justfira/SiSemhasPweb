// public/js/pages/permintaanAkses.js

// Asumsi createElement, createTable, renderPage sudah tersedia secara global
async function handleAccessRequestAction(nim, actionType) {
    try {
        // --- KESALAHAN ADA DI BARIS BAWAH INI ---
        // const response = await fetch(`/api/access-requests/<span class="math-inline">\{nim\}/</span>{actionType}`, {
        // --- PERBAIKI MENJADI SEPERTI INI ---
        const response = await fetch(`/api/access-requests/${nim}/${actionType}`, { // <--- PASTIkan SINTAKS INI BENAR
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Tidak perlu body jika hanya NIM yang dikirim via URL
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${actionType} request.`);
        }

        const result = await response.json();
        alert(result.message);

        renderPage('permintaanAkses'); // Panggil ulang untuk merefresh data
    } catch (error) {
        console.error(`Error ${actionType}ing access request for NIM ${nim}:`, error);
        alert(`Gagal ${actionType} permintaan akses: ${error.message}`);
    }
}

async function renderPermintaanAkses() {
    console.log('--- ENTERING renderPermintaanAkses ---');

    const cardContent = document.createDocumentFragment();

    const cardHeader = createElement('div', ['card-header']);
    cardHeader.appendChild(createElement('h2', [], 'Permintaan Akses'));

    const cardBody = createElement('div', ['card-body']);

    let tableData = [];
    let requests = [];

    try {
        console.log('renderPermintaanAkses: Attempting to fetch data from /api/access-requests');
        const response = await fetch('/api/access-requests');
        console.log('renderPermintaanAkses: Fetch call initiated. Response:', response);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }
        requests = await response.json();
        console.log('renderPermintaanAkses: Data received from API:', requests);

        tableData = requests.map((req, index) => {
            return [
                index + 1,
                req.nama_lengkap,
                req.request_email || 'Belum Terhubung',
                'Mahasiswa',
                ''
            ];
        });
        console.log('renderPermintaanAkses: Formatted tableData:', tableData);

    } catch (error) {
        console.error("renderPermintaanAkses: Failed to fetch access request data:", error);
        cardBody.appendChild(createElement('p', ['error-message'], 'Gagal memuat data pengguna.'));
    }

    const tableHeaders = ['No', 'Nama', 'Email', 'Role', 'Aksi'];
    const permTable = createTable(tableHeaders, tableData, (cellData, rowIndex, colIndex, row) => {
        if (colIndex === 4) { // Kolom 'Aksi'
            const actionDiv = createElement('div', ['action-buttons']);
            const acceptBtn = createElement('button', ['btn-action', 'btn-accept'], 'Terima');
            const rejectBtn = createElement('button', ['btn-action', 'btn-reject'], 'Tolak');

            const originalRequest = requests[rowIndex];
            const nim = originalRequest ? originalRequest.nim : null;

            if (nim !== null) {
                acceptBtn.addEventListener('click', () => handleAccessRequestAction(nim, 'accept'));
                rejectBtn.addEventListener('click', () => handleAccessRequestAction(nim, 'reject'));
            } else {
                acceptBtn.disabled = true;
                rejectBtn.disabled = true;
                console.warn(`NIM not found for row ${rowIndex}, disabling action buttons.`);
            }

            actionDiv.append(acceptBtn, rejectBtn);
            return actionDiv;
        }
        return document.createTextNode(cellData);
    });
    cardBody.appendChild(permTable);
    console.log('renderPermintaanAkses: Table appended to cardBody.');

    const card = createElement('div', ['card']);
    card.append(cardHeader, cardBody);
    console.log('renderPermintaanAkses: Card created and returned.');
    return card;
}