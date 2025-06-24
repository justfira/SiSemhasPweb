// public/js/pages/hapusUser.js

// Asumsi createElement, createTable, renderPage sudah tersedia secara global

async function renderHapusUser() {
    console.log('--- ENTERING renderHapusUser ---');
    const cardContent = document.createDocumentFragment();

    const cardHeader = createElement('div', ['card-header']);
    const headerTitle = createElement('h2', [], 'Hapus User');
    cardHeader.appendChild(headerTitle);

    // Tambahkan tombol kembali ke halaman Daftar Role User di header
    const backButton = createElement('a', ['btn-update', 'btn-history-header'], 'Kembali ke Daftar Role', {
        href: '/admin/daftar-role-user'
    });
    cardHeader.appendChild(backButton);
    cardHeader.style.display = 'flex';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.alignItems = 'center';

    const cardBody = createElement('div', ['card-body']);

    let tableData = [];

    try {
        const apiUrl = '/api/users';
        console.log('renderHapusUser: Attempting to fetch data from:', apiUrl);
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }
        const users = await response.json();
        console.log('renderHapusUser: Data received from API:', users);

        tableData = users.map((user, index) => {
            return [
                index + 1,
                user.name,
                user.email,
                user.role,
                user.email // Menyimpan email untuk keperluan hapus
            ];
        });
       

    } catch (error) {
        console.error("renderHapusUser: Failed to fetch user data:", error);
        cardBody.appendChild(createElement('p', ['error-message'], 'Gagal memuat data pengguna. ' + error.message));
    }

    // Header tabel hanya untuk hapus
    const tableHeaders = ['No', 'Nama', 'Email', 'Role', 'Aksi Hapus'];
    const userTable = createTable(tableHeaders, tableData, (cellData, rowIndex, colIndex, row) => {
        if (colIndex === 4) { // Kolom 'Aksi Hapus'
            const deleteButton = createElement('button', ['btn-danger'], 'Hapus');
            deleteButton.addEventListener('click', async () => {
                const userEmailToDelete = row[2]; // Email user ada di kolom ke-2 (index 2)
                if (confirm(`Anda yakin ingin menghapus user dengan email ${userEmailToDelete}?`)) {
                    try {
                        const response = await fetch(`/api/users/${userEmailToDelete}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Gagal menghapus user.');
                        }

                        alert('User berhasil dihapus!');
                        renderPage('hapusUser'); // Refresh halaman
                    } catch (error) {
                        console.error('Error saat menghapus user:', error);
                        alert(`Gagal menghapus user: ${error.message}`);
                    }
                }
            });
            return deleteButton;
        }
        return document.createTextNode(String(cellData));
    });
    cardBody.appendChild(userTable);

    const card = createElement('div', ['card']);
    card.append(cardHeader, cardBody);
    console.log('renderHapusUser: Card created and returned.');
    return card;
}