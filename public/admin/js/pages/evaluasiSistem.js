// public/js/pages/evaluasiSistem.js

// Asumsi createElement, createTable, renderPage sudah tersedia secara global

async function renderEvaluasiSistem() {
    console.log('--- ENTERING renderEvaluasiSistem ---');
    const cardContent = document.createDocumentFragment();

    const cardHeader = createElement('div', ['card-header']);
    cardHeader.appendChild(createElement('h2', [], 'Evaluasi Sistem'));

    const cardBody = createElement('div', ['card-body']);
    let tableData = [];

    try {
        const apiUrl = '/api/evaluations';
        console.log('renderEvaluasiSistem: Attempting to fetch data from:', apiUrl);
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }
        const evaluations = await response.json();
        console.log('renderEvaluasiSistem: Data received from API:', evaluations);

        tableData = evaluations; // Langsung gunakan data yang sudah diformat dari service

        console.log('renderEvaluasiSistem: Formatted tableData:', tableData);

    } catch (error) {
        console.error("renderEvaluasiSistem: Failed to fetch evaluation data:", error);
        cardBody.appendChild(createElement('p', ['error-message'], 'Gagal memuat data evaluasi. ' + error.message));
    }

    // <--- UBAH HEADER TABEL DI SINI (SESUAI URUTAN BARU, DAN TANPA 'id') ---
    const tableHeaders = [
        'No',
        'dokumentasi',
        'fitur',
        'kemudahan',
        'konten',
        'responsif',
        'kritik',
        'saran'
        // 'id' DIHAPUS DARI HEADER
    ];
    // --- AKHIR PERUBAHAN HEADER ---

    const evalTable = createTable(tableHeaders, tableData, (cellData, rowIndex, colIndex) => {
        if (colIndex === 0) { // Kolom 'No'
            return document.createTextNode(rowIndex + 1); // Nomor urut
        }
        return document.createTextNode(String(cellData));
    });
    cardBody.appendChild(evalTable);

    // --- TAMBAHKAN TOMBOL GENERATE PDF DI SINI ---
    const generatePdfButton = createElement('button', ['btn-update'], 'Generate PDF Laporan');
    generatePdfButton.style.marginBottom = '20px'; // Ini styling margin langsung di JS
    generatePdfButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/evaluations/generate-pdf');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
            }
            // Menerima file PDF sebagai blob dan membuat URL objek untuk mengunduhnya
            const pdfBlob = await response.blob();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Membuat link download sementara dan mengkliknya
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.download = 'laporan_evaluasi_sistem.pdf'; // Nama file yang akan diunduh
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink); // Hapus link setelah diklik
            URL.revokeObjectURL(pdfUrl); // Bersihkan URL objek

            alert('PDF Laporan berhasil di-generate dan diunduh!');

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Gagal mengenerate PDF Laporan: ${error.message}`);
        }
    });
    cardBody.appendChild(generatePdfButton); // Tambahkan tombol ke cardBody, atau cardFooter


    const card = createElement('div', ['card']);
    card.append(cardHeader, cardBody);
    console.log('renderEvaluasiSistem: Card created and returned.');
    return card;
}