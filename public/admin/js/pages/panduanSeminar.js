// public/js/pages/panduanSeminar.js

// ... (Asumsi createElement, createTable, renderPage sudah tersedia secara global) ...

async function renderPanduanSeminar() {
    console.log('--- ENTERING renderPanduanSeminar ---');
    const cardContent = document.createDocumentFragment();

    const cardHeader = createElement('div', ['card-header']);
    const headerTitle = createElement('h2', [], 'Panduan Seminar Hasil');
    cardHeader.appendChild(headerTitle);

    // --- TOMBOL LIHAT RIWAYAT PANDUAN ---
    const historyButton = createElement('a', ['btn-update', 'btn-history-header'], 'Lihat Riwayat Panduan', {
        href: '/admin/panduan-riwayat' // <--- LINK KE HALAMAN RIWAYAT
    });
    cardHeader.appendChild(historyButton); // Pindahkan tombol ke cardHeader

    // Tambahkan styling untuk cardHeader agar kontennya sejajar
    cardHeader.style.display = 'flex';
    cardHeader.style.justifyContent = 'space-between'; // Memisahkan judul dan tombol
    cardHeader.style.alignItems = 'center'; // Pusatkan secara vertikal


    const cardBody = createElement('div', ['card-body']);

    const panduanSection = createElement('div', ['panduan-upload-section']);

    // --- BAGIAN BUKU PANDUAN TERBARU --- (Tetap sama)
    const bookCard = createElement('div', ['panduan-card', 'book-panduan']);
    bookCard.appendChild(createElement('h3', [], 'Buku Panduan Terbaru'));
    const imgContainer = createElement('div', ['panduan-image-container']);
    const pdfLink = createElement('a', [], '', { target: '_blank' }); // Link untuk PDF
    const defaultPdfIcon = createElement('img', ['panduan-thumbnail'], '', {
        src: '/admin/img/pdf-icon.png', // <--- GANTI DENGAN PATH ICON PDF ANDA
        alt: 'PDF Icon'
    });
    pdfLink.appendChild(defaultPdfIcon);
    const pdfTitle = createElement('p', [], 'Memuat...'); // Nama file PDF
    pdfLink.appendChild(pdfTitle);
    imgContainer.appendChild(pdfLink);
    bookCard.appendChild(imgContainer);
    panduanSection.appendChild(bookCard);

    try {
        const response = await fetch('/api/panduan/latest');
        if (response.ok) {
            const latest = await response.json();
            if (latest && latest.id_panduan && latest.nama_file) {
                pdfLink.href = `/api/panduan/file/${latest.id_panduan}`;
                pdfTitle.textContent = latest.nama_file;
            } else {
                pdfTitle.textContent = 'Tidak ada panduan tersedia';
                pdfLink.removeAttribute('href');
            }
        } else if (response.status === 404) {
            pdfTitle.textContent = 'Tidak ada panduan tersedia';
            pdfLink.removeAttribute('href');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching latest panduan:", error);
        pdfTitle.textContent = 'Gagal memuat panduan terbaru';
        pdfLink.removeAttribute('href');
    }

    // --- BAGIAN UPLOAD PANDUAN --- (Tetap sama)
    const uploadCard = createElement('div', ['panduan-card', 'upload-panduan']);
    uploadCard.appendChild(createElement('h3', [], 'Unggah Panduan Baru'));
    const uploadArea = createElement('div', ['upload-area']);
    const uploadIcon = createElement('i', ['fas', 'fa-cloud-upload-alt', 'upload-icon']);
    const fileInput = createElement('input', [], '', { type: 'file', id: 'uploadFile', accept: '.pdf' });
    fileInput.style.display = 'none';
    const uploadLabel = createElement('label', ['btn-upload-file'], 'Pilih File PDF', { 'for': 'uploadFile' });
    const fileNameSpan = createElement('span', ['file-name-display'], 'Belum ada file dipilih');

    uploadArea.append(uploadIcon, fileInput, uploadLabel, fileNameSpan);
    uploadCard.appendChild(uploadArea);
    panduanSection.appendChild(uploadCard);

    const uploadButton = createElement('button', ['btn-update'], 'Unggah Panduan');
    uploadCard.appendChild(uploadButton);

    fileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            fileNameSpan.textContent = event.target.files[0].name;
        } else {
            fileNameSpan.textContent = 'Belum ada file dipilih';
        }
    });

    uploadButton.addEventListener('click', async () => {
        if (fileInput.files.length === 0) {
            alert('Mohon pilih file PDF terlebih dahulu.');
            return;
        }
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('pdfFile', file);

        try {
            const response = await fetch('/api/panduan/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengunggah panduan.');
            }

            const result = await response.json();
            alert(result.message);
            console.log('Upload berhasil:', result);

            fileInput.value = '';
            fileNameSpan.textContent = 'Belum ada file dipilih';
            renderPage('panduanSeminar'); // Refresh halaman
        } catch (error) {
            console.error('Error saat mengunggah panduan:', error);
            alert(`Gagal mengunggah panduan: ${error.message}`);
        }
    });

    cardBody.appendChild(panduanSection); // panduanSection berisi bookCard dan uploadCard

    const card = createElement('div', ['card']);
    card.append(cardHeader, cardBody);
    console.log('renderPanduanSeminar: Card created and returned.');
    return card;
}