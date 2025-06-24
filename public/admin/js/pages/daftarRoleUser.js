// public/js/pages/daftarRoleUser.js

// Asumsi createElement, createTable, pendingRoleUpdates, renderPage sudah tersedia secara global

async function renderDaftarRoleUser() {
    console.log('--- ENTERING renderDaftarRoleUser ---');
    const cardContent = document.createDocumentFragment();

    const cardHeader = createElement('div', ['card-header']);
    const headerTitle = createElement('h2', [], 'Daftar Role User');
    cardHeader.appendChild(headerTitle);

    // Tombol untuk navigasi ke halaman Hapus User
    const goToDeleteButton = createElement('a', ['btn-danger', 'btn-header'], 'Hapus User', {
        href: '/admin/hapus-user'
    });
    cardHeader.appendChild(goToDeleteButton);

    // Styling untuk cardHeader agar kontennya sejajar
    cardHeader.style.display = 'flex';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.alignItems = 'center';

    const cardBody = createElement('div', ['card-body']);

    let tableData = [];

    try {
        const apiUrl = '/api/users';
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
                '', // Kolom update
            ];
        });
        console.log('renderDaftarRoleUser: Formatted tableData:', tableData);

    } catch (error) {
        console.error("renderDaftarRoleUser: Failed to fetch user data:", error);
        cardBody.appendChild(createElement('p', ['error-message'], 'Gagal memuat data pengguna. ' + error.message));
    }

    // Headers tabel tanpa 'Hapus'
    const tableHeaders = ['No', 'Nama', 'Email', 'Role', 'Update'];
    const userTable = createTable(tableHeaders, tableData, (cellData, rowIndex, colIndex, row) => {
        if (colIndex === 4) { // Kolom 'Update'
            const selectUpdate = createElement('select');
            ['Mahasiswa', 'Dosen', 'Admin', 'Kadep'].forEach(optionText => {
                const option = createElement('option', [], optionText);
                if (optionText.toUpperCase() === String(row[3])) {
                    option.selected = true;
                }
                selectUpdate.appendChild(option);
            });

            selectUpdate.addEventListener('change', (event) => {
                const newRole = event.target.value;
                const userEmail = row[2];
                pendingRoleUpdates.set(userEmail, newRole);
                console.log(`Perubahan role disimpan sementara untuk ${userEmail}: ${row[3]} -> ${newRole}`);
            });
            return selectUpdate;
        }
        return document.createTextNode(String(cellData));
    });
    cardBody.appendChild(userTable);

    const cardFooter = createElement('div', ['card-footer']);
    const updateButton = createElement('button', ['btn-update'], 'Update Role');

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

            pendingRoleUpdates.clear();
            renderPage('daftarRoleUser');
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