document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      const card = await renderPanduanMahasiswa();
      contentArea.innerHTML = '';
      contentArea.appendChild(card);
    } else {
      console.error('Elemen .content-area tidak ditemukan');
    }
  });

async function renderPanduanMahasiswa() {
    const content = document.createDocumentFragment();
    const card = createElement('div', ['card']);

    try {
        console.log("Memuat data panduan...");
        const response = await fetch('/panduan/latest');
        console.log("Data dari /panduan/latest:", latest);

        if (response.ok && latest && latest.id_panduan && latest.nama_file) {            const latest = await response.json();
                const link = createElement('a', ['panduan-thumbnail-link'], '', {
                    href: `/panduan/file/${latest.id_panduan}`,
                    target: '_blank'
                });

                const img = createElement('img', ['panduan-thumbnail'], '', {
                    src: '/admin/img/pdf-icon.png',
                    alt: 'PDF Panduan'
                });

                link.appendChild(img);
                card.appendChild(link);
            } else {
                card.appendChild(createElement('p', [], 'Buku panduan belum ada'));
            }
    } catch (error) {
        console.error("Gagal memuat buku panduan:", error);
        card.appendChild(createElement('p', [], 'Terjadi kesalahan saat memuat panduan'));
    }

    content.appendChild(card);
    return content;
}

// Helper function
function createElement(tag, classNames = [], textContent = '', attributes = {}) {
    const element = document.createElement(tag);
    if (classNames.length) element.classList.add(...classNames);
    if (textContent) element.textContent = textContent;
    for (const attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
    }
    return element;
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        const card = await renderPanduanMahasiswa();
        contentArea.innerHTML = '';
        contentArea.appendChild(card);
    } else {
        console.error('❌ .content-area tidak ditemukan!');
    }
});