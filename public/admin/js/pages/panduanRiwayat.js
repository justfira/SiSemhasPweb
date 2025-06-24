// public/js/pages/panduanRiwayat.js

// Asumsi createElement, createTable, renderPage sudah tersedia secara global

async function renderPanduanRiwayat() {
    console.log('--- ENTERING renderPanduanRiwayat ---');
    const cardContent = document.createDocumentFragment();

    const cardHeader = createElement('div', ['card-header']);
    const headerTitle = createElement('h2', [], 'Riwayat Unggah Panduan');
    cardHeader.appendChild(headerTitle);

    // --- TOMBOL KEMBALI KE UNGGAH PANDUAN ---
    const backButton = createElement('a', ['btn-update', 'btn-history-header'], 'Kembali ke Unggah Panduan', {
        href: '/admin/panduan-seminar'
    });
    cardHeader.appendChild(backButton); // Pindahkan tombol ke cardHeader

    // Tambahkan styling untuk cardHeader agar kontennya sejajar
    cardHeader.style.display = 'flex';
    cardHeader.style.justifyContent = 'space-between'; // Memisahkan judul dan tombol
    cardHeader.style.alignItems = 'center'; // Pusatkan secara vertikal


    const cardBody = createElement('div', ['card-body']);
    let panduanListData = [];

    try {
        const response = await fetch('/api/panduan/list'); // API untuk daftar semua panduan
        if (response.ok) {
            const list = await response.json();
            panduanListData = list.map((item, index) => {
                return [
                    index + 1, // Riwayat (No)
                    item.namaFile,
                    item.tanggalUnggah,
                    item.id // Simpan ID untuk tombol aksi
                ];
            });
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching panduan list for history page:", error);
        cardBody.appendChild(createElement('p', ['error-message'], 'Gagal memuat riwayat panduan. ' + error.message));
    }

    const tableHeaders = ['No', 'Judul', 'Tanggal Unggah', 'Aksi']; // Header tabel riwayat
    const panduanTable = createTable(tableHeaders, panduanListData, (cellData, rowIndex, colIndex, rowData) => {
        if (colIndex === 3) { // Kolom 'Aksi'
            const downloadLink = createElement('a', ['btn-action', 'btn-accept'], 'Lihat/Unduh', {
                href: `/api/panduan/file/${rowData[3]}`, // rowData[3] adalah ID panduan
                target: '_blank'
            });
            return downloadLink;
        }
        return document.createTextNode(String(cellData));
    });
    panduanTable.classList.add('panduan-table');
    cardBody.appendChild(panduanTable);

    const card = createElement('div', ['card']);
    card.append(cardHeader, cardBody);
    console.log('renderPanduanRiwayat: Card created and returned.');
    return card;
}