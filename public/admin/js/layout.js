// public/js/layout.js

// Asumsi utils.js sudah dimuat sebelumnya, sehingga createElement dan createTable tersedia
// Variabel global
const pendingRoleUpdates = new Map();

function renderstatussemhas() {
    const cardHeader = createElement('div', ['card-header']);
    cardHeader.appendChild(createElement('h2', [], 'Status Semhas'));

    const cardBody = createElement('div', ['card-body']);
    let tableData = [];


    exports.getPendaftaran = async (req, res) => {

  try {
    // Ambil semua data pendaftaran dimana nama_laporan tidak null
    const pendaftaran = await prisma.pendaftaran.findMany({
      where: {
        nama_laporan: {
          not: null, // Pastikan nama_laporan tidak null
        }
      },
      select: {
        id_pendaftaran: true,
        judul: true,
        bidang_penelitian: true,
        status: true,
      },
      orderBy: {
        id_pendaftaran: 'desc', // Urutkan berdasarkan id_pendaftaran jika perlu
      }
    });

    // Render data pendaftaran ke halaman admin
    res.render('admin/statusSemhas', {
      pendaftaran,
    });

  } catch (error) {
    console.error('Error fetching pendaftaran data:', error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data');
  }
};

const card = createElement('div', ['card']);
    card.append(cardHeader, cardBody);
    return card;

}

function createHeader() {
    const header = createElement('header', ['header']);
    const headerLeft = createElement('div', ['header-left']);
    const logoImage = createElement(
            'img',                         // tag: 'img'
            ['logo'],                      // classes: ['logo']
            '',                            // textContent: kosong untuk elemen img
            {                              // attributes: objek untuk src dan alt
                src: '/admin/img/Logo_Unand.png',
                alt: 'Logo Universitas Andalas'
            }
    );
    const mobileToggle = createElement('i', ['fas', 'fa-arrow-left', 'mobile-sidebar-toggle']);
    const titleSpan = createElement('span', [], 'SISemhas - Universitas Andalas');
    headerLeft.append(logoImage, titleSpan);

    // const headerRight = createElement('div', ['header-right']);
    // const userIcon = createElement('i', ['far', 'fa-user-circle', 'user-icon']);
    // headerRight.appendChild(userIcon);

    header.append(headerLeft);
    return header;
}

function createSidebar(activePage) {
    const aside = createElement('aside', ['sidebar']);
    const ul = createElement('ul', ['sidebar-menu']);

    const menuItems = [
        { text: 'Daftar Role User', id: 'daftarRoleUser', url: '/admin/daftar-role-user' }, // Tambah URL
        { text: 'Panduan Seminar Hasil', id: 'panduanSeminar', url: '/admin/panduan-seminar' }, // Tambah URL
        { text: 'Evaluasi Sistem', id: 'evaluasiSistem', url: '/admin/evaluasi-sistem' }, // Tambah URL
        { text: 'Memilih Jadwal', id: 'milihjadwal', url: '/admin/mahasiswa' },
    ];

    menuItems.forEach(item => {
        const li = createElement('li');
        const a = createElement('a', [], item.text, { href: item.url }); // <--- Gunakan item.url untuk href
        a.dataset.page = item.id; // Data attribute tetap untuk renderPage

        if (item.id === activePage) {
            a.classList.add('active');
        }

        // TIDAK ADA LAGI addEventListener DI SINI! Browser akan melakukan navigasi normal
        // a.addEventListener('click', async (e) => {
        //     e.preventDefault(); // Tidak perlu preventDefault lagi
        //     await renderPage(item.id); // Browser akan muat ulang halaman dengan URL baru
        // });

        li.appendChild(a);
        ul.appendChild(li);
    });

    aside.appendChild(ul);
    // ... (kode setTimeout untuk mobile toggle) ...
    return aside;
}

async function renderPage(pageId) {
    const appContainer = document.getElementById('app'); // Asumsi 'app' adalah div utama di HTML
    appContainer.innerHTML = '';

    const header = createHeader();
    const mainContent = createElement('main', ['main-content']);
    const sidebar = createSidebar(pageId);
    const contentArea = createElement('section', ['content-area']);

    let pageContent;
    switch (pageId) {
        case 'daftarRoleUser':
            pageContent = await renderDaftarRoleUser(); // Panggil fungsi dari file terpisah
            break;
        case 'permintaanAkses':
            pageContent = await renderPermintaanAkses(); // Panggil fungsi dari file terpisah
            break;
        case 'panduanSeminar':
            pageContent = await renderPanduanSeminar(); // Panggil fungsi dari file terpisah
            break;
        case 'evaluasiSistem':
            pageContent = await renderEvaluasiSistem(); // Panggil fungsi dari file terpisah
            break;
        case 'panduanRiwayat': // <--- TAMBAHKAN CASE BARU INI
            pageContent = await renderPanduanRiwayat();
            break;
        case 'hapusUser': // <--- TAMBAHKAN CASE BARU INI
            pageContent = await renderHapusUser();
            break;
        // case 'daftarJadwal':
        //     pageContent = renderDaftarJadwal(); // Panggil fungsi dari file terpisah
        //     break;
        default:
            pageContent = await renderDaftarRoleUser();
            pageId = 'daftarRoleUser';
    }

    contentArea.appendChild(pageContent);
    mainContent.append(sidebar, contentArea);
    appContainer.append(header, mainContent);

    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
