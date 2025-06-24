// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const appContainer = document.getElementById('app');

    // Variabel global untuk menyimpan role filter yang aktif
    let currentRoleFilter = 'semua'; // Default filter

    // Variabel global untuk menyimpan perubahan role (untuk Update Role)
    // Key: email user, Value: newRole
    const pendingRoleUpdates = new Map();


    // Fungsi pembantu untuk membuat elemen dengan kelas dan teks
    function createElement(tag, classes = [], textContent = '', attributes = {}) {
        const element = document.createElement(tag);
        if (classes.length > 0) {
            element.classList.add(...classes);
        }
        if (textContent) {
            element.textContent = textContent;
        }
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        return element;
    }

    // Fungsi untuk membuat header
    function createHeader() {
        const header = createElement('header', ['header']);

        const headerLeft = createElement('div', ['header-left']);
        const mobileToggle = createElement('i', ['fas', 'fa-arrow-left', 'mobile-sidebar-toggle']);
        const titleSpan = createElement('span', [], 'SISemhas - Universitas Andalas');
        headerLeft.append(mobileToggle, titleSpan);

        const headerRight = createElement('div', ['header-right']);
        const userIcon = createElement('i', ['far', 'fa-user-circle', 'user-icon']);
        headerRight.appendChild(userIcon);

        header.append(headerLeft, headerRight);
        return header;
    }

    // Fungsi untuk membuat sidebar
    function createSidebar(activePage) {
        const aside = createElement('aside', ['sidebar']);
        const ul = createElement('ul', ['sidebar-menu']);

        const menuItems = [
            { text: 'Daftar Role User', id: 'daftarRoleUser' },
            { text: 'Permintaan Akses', id: 'permintaanAkses' },
            { text: 'Panduan Seminar Hasil', id: 'panduanSeminar' },
            { text: 'Evaluasi Sistem', id: 'evaluasiSistem' },
            { text: 'Daftar Jadwal', id: 'daftarJadwal' },
        ];

        menuItems.forEach(item => {
            const li = createElement('li');
            const a = createElement('a', [], item.text, { href: '#' });
            a.dataset.page = item.id;

            if (item.id === activePage) {
                a.classList.add('active');
            }

            a.addEventListener('click', async (e) => { // Pastikan ini async
                e.preventDefault();
                await renderPage(item.id); // Pastikan ini await
            });

            li.appendChild(a);
            ul.appendChild(li);
        });

        aside.appendChild(ul);

        // Toggle sidebar di mobile
        setTimeout(() => {
            const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
            const sidebar = document.querySelector('.sidebar');
            if (mobileToggle && sidebar) {
                mobileToggle.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });
            }
        }, 0);

        return aside;
    }

    // Fungsi untuk membuat tabel generik
    function createTable(headers, data, renderCellContent) {
        const table = createElement('table', ['user-table']);
        const thead = createElement('thead');
        const tbody = createElement('tbody');

        const headerRow = createElement('tr');
        headers.forEach(headerText => {
            const th = createElement('th', [], headerText);
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        data.forEach((rowData, rowIndex) => {
            const tr = createElement('tr');
            rowData.forEach((cellData, colIndex) => {
                const td = createElement('td');
                // renderCellContent harus mengembalikan Node, bukan Promise atau null
                const content = renderCellContent(cellData, rowIndex, colIndex, rowData);
                if (content instanceof Node) { // Periksa apakah hasilnya adalah Node
                    td.appendChild(content);
                } else if (content !== null && content !== undefined) {
                    td.textContent = String(content); // Jika bukan Node tapi ada isinya, convert ke string
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.append(thead, tbody);
        return table;
    }


    // --- Halaman: Daftar Role User ---
    async function renderDaftarRoleUser() {
        console.log('--- ENTERING renderDaftarRoleUser ---');
        const cardContent = document.createDocumentFragment();

        const cardHeader = createElement('div', ['card-header']);
        cardHeader.appendChild(createElement('h2', [], 'Daftar Role User'));

        

        const cardBody = createElement('div', ['card-body']);

        let tableData = []; // Pastikan deklarasi ini ada di sini.

        try {
            const apiUrl = currentRoleFilter && currentRoleFilter !== 'semua'
                         ? `/api/users?role=${currentRoleFilter}`
                         : '/api/users';
            console.log('renderDaftarRoleUser: Attempting to fetch data from:', apiUrl);
            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
            }
            const users = await response.json();
            console.log('renderDaftarRoleUser: Data received from API:', users);

            tableData = users.map((user, index) => {
                return [
                    index + 1,
                    user.name,
                    user.email,
                    user.role,
                    ''
                ];
            });
            console.log('renderDaftarRoleUser: Formatted tableData:', tableData);

        } catch (error) {
            console.error("renderDaftarRoleUser: Failed to fetch user data:", error);
            cardBody.appendChild(createElement('p', ['error-message'], 'Gagal memuat data pengguna. ' + error.message));
        }

        const tableHeaders = ['No', 'Nama', 'Email', 'Role', 'Update'];
        const userTable = createTable(tableHeaders, tableData, (cellData, rowIndex, colIndex, row) => {
            if (colIndex === 4) { // Kolom 'Update'
                const selectUpdate = createElement('select');
                ['Mahasiswa', 'Dosen', 'Admin', 'Kadep'].forEach(optionText => {
                    const option = createElement('option', [], optionText);
                    if (optionText.toLowerCase() === row[3].toLowerCase()) {
                        option.selected = true;
                    }
                    selectUpdate.appendChild(option);
                });

                // Event listener untuk menyimpan perubahan role ke Map
                selectUpdate.addEventListener('change', (event) => {
                    const newRole = event.target.value;
                    const userEmail = row[2]; // Email ada di kolom ke-2 (index 2)
                    pendingRoleUpdates.set(userEmail, newRole); // Simpan perubahan
                    console.log(`Perubahan role disimpan sementara untuk ${userEmail}: ${row[3]} -> ${newRole}`);
                });
                return selectUpdate;
            }
            return document.createTextNode(cellData);
        });
        cardBody.appendChild(userTable);

        const cardFooter = createElement('div', ['card-footer']);
        const updateButton = createElement('button', ['btn-update'], 'Update Role');

        // Event listener untuk tombol "Update Role"
        updateButton.addEventListener('click', async () => {
            if (pendingRoleUpdates.size === 0) {
                alert('Tidak ada perubahan role yang terdeteksi.');
                return;
            }

            const updatesToSend = Array.from(pendingRoleUpdates.entries()).map(([email, newRole]) => ({ email, newRole }));
            console.log('Mengirim update role ke backend:', updatesToSend);

            try {
                const response = await fetch('/api/users/roles', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatesToSend),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal mengupdate role.');
                }

                const result = await response.json();
                alert(`Update role selesai: ${result.message}\nDetail: ${result.results.map(r => `${r.email}: ${r.message}`).join('\n')}`);
                console.log('Update role berhasil:', result);

                // Bersihkan pending updates dan refresh tabel setelah berhasil
                pendingRoleUpdates.clear();
                renderPage('daftarRoleUser'); // Refresh halaman untuk menampilkan role terbaru
            } catch (error) {
                console.error('Error saat mengupdate role:', error);
                alert(`Gagal mengupdate role: ${error.message}`);
            }
        });

        cardFooter.appendChild(updateButton);

        const card = createElement('div', ['card']);
        card.append(cardHeader, cardBody, cardFooter);
        console.log('renderDaftarRoleUser: Card created and returned.');
        return card;
    }


    // --- Halaman: Permintaan Akses ---
    async function handleAccessRequestAction(nim, actionType) {
        try {
            const response = await fetch(`/api/access-requests/${nim}/${actionType}`, { // <--- HAPUS <span...>, \{...\} dan pastikan pakai ${nim} dan ${actionType}
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Tidak perlu body jika hanya NIM yang dikirim via URL
            });

            if (!response.ok) {
            const errorData = await response.json(); // Ini akan error jika responsnya HTML, seperti yang terjadi sebelumnya
            throw new Error(errorData.message || `Failed to ${actionType} request.`);
            }

            const result = await response.json();
            alert(result.message); // Tampilkan pesan sukses

            // Setelah berhasil, refresh tabel permintaan akses
            renderPage('permintaanAkses'); // Panggil ulang untuk merefresh data
        } catch (error) {
            console.error(`Error ${actionType}ing access request for NIM ${nim}:`, error);
            alert(`Gagal ${actionType} permintaan akses: ${error.message}`);
        }
    }


    // --- Halaman: Permintaan Akses ---
    async function renderPermintaanAkses() { // Pastikan ini async
        console.log('--- ENTERING renderPermintaanAkses ---');

        const cardContent = document.createDocumentFragment();

        const cardHeader = createElement('div', ['card-header']);
        cardHeader.appendChild(createElement('h2', [], 'Permintaan Akses'));

        const cardBody = createElement('div', ['card-body']);

        let tableData = [];
        let requests = []; // Deklarasikan 'requests' di sini agar bisa diakses di luar try-catch

        try {
            console.log('renderPermintaanAkses: Attempting to fetch data from /api/access-requests');
            const response = await fetch('/api/access-requests');
            console.log('renderPermintaanAkses: Fetch call initiated. Response:', response);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
            }
            requests = await response.json(); // Data permintaan dari API
            console.log('renderPermintaanAkses: Data received from API:', requests);

            tableData = requests.map((req, index) => {
                return [
                    index + 1,
                    req.nama_lengkap,
                    req.request_email || 'Belum Terhubung', // TAMPILKAN request_email
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

    // --- Halaman: Panduan Seminar Hasil ---
    function renderPanduanSeminar() {
        const cardContent = document.createDocumentFragment();

        const cardHeader = createElement('div', ['card-header']);
        cardHeader.appendChild(createElement('h2', [], 'Panduan Seminar Hasil'));

        const cardBody = createElement('div', ['card-body']);

        const panduanSection = createElement('div', ['panduan-upload-section']);

        const bookCard = createElement('div', ['panduan-card', 'book-panduan']);
        bookCard.appendChild(createElement('h3', [], 'Buku Panduan'));
        const imgContainer = createElement('div', ['panduan-image-container']);
        const img = createElement('img', ['panduan-thumbnail'], '', { src: 'placeholder_book.jpg', alt: 'Buku Panduan' });
        imgContainer.appendChild(img);
        bookCard.appendChild(imgContainer);
        panduanSection.appendChild(bookCard);

        const uploadCard = createElement('div', ['panduan-card', 'upload-panduan']);
        uploadCard.appendChild(createElement('h3', [], 'Update Panduan'));
        const uploadArea = createElement('div', ['upload-area']);
        const uploadIcon = createElement('i', ['fas', 'fa-cloud-upload-alt', 'upload-icon']);
        const fileInput = createElement('input', [], '', { type: 'file', id: 'uploadFile' });
        fileInput.style.display = 'none'; // Sembunyikan input asli
        const uploadLabel = createElement('label', ['btn-upload-file'], 'Update File', { 'for': 'uploadFile' });
        uploadArea.append(uploadIcon, fileInput, uploadLabel);
        uploadCard.appendChild(uploadArea);
        panduanSection.appendChild(uploadCard);

        cardBody.appendChild(panduanSection);

        const tableHeaders = ['Riwayat', 'Judul', 'Versi', 'Tanggal Unggah'];
        const tableData = [
            ['1', 'Panduan Penelitian dan Pengabdian Kepada Masyarakat', '2023.1.1', '4/4/2023'],
            ['2', 'Panduan Penelitian dan Pengabdian Kepada Masyarakat', '2023.1.0', '1/1/2023'],
            ['3', 'Panduan Penelitian dan Pengabdian Kepada Masyarakat', '2022.1.1', '4/12/2022'],
        ];

        const panduanTable = createTable(tableHeaders, tableData, (cellData) => document.createTextNode(cellData));
        panduanTable.classList.add('panduan-table'); // Tambahkan kelas spesifik jika perlu
        cardBody.appendChild(panduanTable);

        const card = createElement('div', ['card']);
        card.append(cardHeader, cardBody);
        return card;
    }

    // --- Halaman: Evaluasi Sistem ---
    function renderEvaluasiSistem() {
        const cardContent = document.createDocumentFragment();

        const cardHeader = createElement('div', ['card-header']);
        cardHeader.appendChild(createElement('h2', [], 'Evaluasi Sistem'));

        const roleFilter = createElement('div', ['role-filter']);
        roleFilter.appendChild(createElement('label', [], 'Role :', { 'for': 'role-select-eval' }));
        const selectFilter = createElement('select', [], '', { id: 'role-select-eval' });
        ['Semua', 'Mahasiswa', 'Dosen', 'Admin'].forEach(optionText => {
            const option = createElement('option', [], optionText, { value: optionText.toLowerCase() });
            selectFilter.appendChild(option);
        });
        roleFilter.appendChild(selectFilter);
        cardHeader.appendChild(roleFilter);

        const cardBody = createElement('div', ['card-body']);
        const tableHeaders = ['No', 'Nama', 'Masukan', 'Role'];
        const tableData = [
            ['1', 'andi', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 'Mahasiswa'],
            ['2', 'budi', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 'Mahasiswa'],
            ['3', 'cika', 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', 'Dosen'],
        ];

        const evalTable = createTable(tableHeaders, tableData, (cellData) => document.createTextNode(cellData));
        cardBody.appendChild(evalTable);

        const card = createElement('div', ['card']);
        card.append(cardHeader, cardBody);
        return card;
    }

    // --- Halaman: Daftar Jadwal ---
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


    // --- Fungsi Utama untuk Merender Seluruh Halaman ---
    async function renderPage(pageId) { // TAMBAHKAN 'async' DI SINI
        appContainer.innerHTML = ''; // Bersihkan konten sebelumnya

        const header = createHeader();
        const mainContent = createElement('main', ['main-content']);
        const sidebar = createSidebar(pageId);
        const contentArea = createElement('section', ['content-area']);

        let pageContent;
        switch (pageId) {
            case 'daftarRoleUser':
                pageContent = await renderDaftarRoleUser(); // TAMBAHKAN 'await' DI SINI
                break;
            case 'permintaanAkses':
                pageContent = await renderPermintaanAkses();
                break;
            case 'panduanSeminar':
                pageContent = renderPanduanSeminar();
                break;
            case 'evaluasiSistem':
                pageContent = renderEvaluasiSistem();
                break;
            case 'daftarJadwal':
                pageContent = renderDaftarJadwal();
                break;
            default:
                pageContent = await renderDaftarRoleUser(); // Default page
                pageId = 'daftarRoleUser'; // Set active for default
        }

        contentArea.appendChild(pageContent);
        mainContent.append(sidebar, contentArea);
        appContainer.append(header, mainContent);

        // Update active class on sidebar after rendering
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Render halaman default saat aplikasi pertama kali dimuat
    await renderPage('daftarRoleUser');
});