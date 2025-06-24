// Variabel global untuk menampung instance DataTable
let table;
// Variabel global untuk seminar ID (id_rubik) yang akan diupdate
let currentSeminarId = null;

$(document).ready(function() {
    // 1. Inisialisasi DataTables
    table = $('#riwayatSeminarTable').DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/dosen/riwayatseminar/api/data",
            "type": "GET",
            // Tambahkan error handling khusus untuk Ajax
            "error": function(xhr, error, thrown) {
                console.error("DataTables Ajax Error:", xhr.status, thrown, xhr.responseText);
                let errorMessage = 'Terjadi kesalahan saat memuat data.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                Swal.fire('Gagal Memuat Data', errorMessage, 'error');
                // Optional: Sembunyikan pesan default DataTables
                $('.dataTables_processing').hide(); 
            }
        },
        "columns": [
            { "data": "no", "orderable": false, "searchable": false },
            { "data": "nim" },
            { "data": "nama" },
            { "data": "judul" },
            { "data": "status", "orderable": false, "searchable": false },
            { "data": "tanggalSeminar" },
            { "data": "actions", "orderable": false, "searchable": false }
        ],
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.13.7/i18n/id.json"
        },
        "responsive": true
    });

    // 2. Event listener untuk form submit di modal
    $('#updateForm').on('submit', function(e) {
        e.preventDefault();

        const status = $('#statusSelect').val();
        const catatan = $('#catatanText').val();

        if (!status) {
            Swal.fire('Error', 'Silakan pilih status terlebih dahulu.', 'error');
            return;
        }
        
        // Pastikan currentSeminarId sudah diset
        if (!currentSeminarId) {
            Swal.fire('Error', 'ID Seminar tidak ditemukan. Coba lagi.', 'error');
            return;
        }

        // Kirim data menggunakan Fetch API
        fetch(`/dosen/riwayatseminar/status/${currentSeminarId}`, { // Menggunakan currentSeminarId (id_rubik)
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status, catatan: catatan })
        })
        .then(response => {
            // Cek apakah respons HTTP successful (status 2xx)
            if (!response.ok) {
                // Jika tidak successful, coba parse JSON error dari server
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Terjadi kesalahan pada server.');
                });
            }
            // Jika successful, lanjutkan parsing JSON data
            return response.json();
        })
        .then(data => {
            if (data.success) {
                closeModal();
                Swal.fire({
                    title: 'Berhasil!',
                    text: data.message,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                table.ajax.reload(null, false); // Reload tabel tanpa kembali ke halaman pertama
            } else {
                // Ini akan menangani kasus di mana server merespons 200 OK
                // tetapi success: false (misalnya, validasi di controller)
                Swal.fire('Gagal!', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            // Menampilkan pesan error yang lebih spesifik dari server atau pesan default
            Swal.fire('Error!', error.message || 'Terjadi kesalahan saat menghubungi server.', 'error');
        });
    });
});

// 3. Fungsi yang dipanggil dari tombol 'Detail' di dalam tabel
function viewDetail(id) { // id ini adalah id_rubik
    window.location.href = `/dosen/riwayatseminar/detail/${id}`;
}

// 4. Fungsi yang dipanggil dari tombol 'Update' di dalam tabel
function updateStatus(id) { // id ini adalah id_rubik
    currentSeminarId = id;
    $('#updateForm')[0].reset();
    $('#updateModal').removeClass('hidden'); // Menampilkan modal
}

// 5. Fungsi untuk menutup modal
function closeModal() {
    $('#updateModal').addClass('hidden'); // Menyembunyikan modal
}