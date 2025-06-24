document.addEventListener('DOMContentLoaded', function () {
    console.log('Application initialized');
    attachEventListeners();
});

function attachEventListeners() {
    const form = document.getElementById('dosenForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        const nama = document.getElementById('nama_lengkap').value.trim();
        const nim = document.getElementById('nim').value.trim();
        const judul = document.getElementById('judul').value.trim();
        const bidang = document.getElementById('bidangPenelitian').value;
        const dosen = document.getElementById('nipDosen').value;

        let valid = true;

        if (!nama) {
            alert('Nama tidak boleh kosong');
            valid = false;
        }

        if (!/^\d{10,}$/.test(nim)) {
            alert('NIM harus berupa angka minimal 10 digit');
            valid = false;
        }

        if (!judul) {
            alert('Judul harus diisi');
            valid = false;
        }

        if (!bidang) {
            alert('Bidang penelitian harus dipilih');
            valid = false;
        }

        if (!dosen) {
            alert('Dosen pembimbing harus dipilih');
            valid = false;
        }

        if (!valid) {
            e.preventDefault();
        }
    });
}
