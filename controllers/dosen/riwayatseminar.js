const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Menampilkan halaman utama Riwayat Seminar
exports.index = (req, res) => {
    res.render('dosen/riwayatseminar', {
        title: 'Riwayat Seminar',
        user: req.user
    });
};

// Menyediakan data untuk API DataTables
exports.getApiData = async (req, res) => {
    try {
        // Asumsi: req.user.userId adalah id_user dari dosen yang sedang login (NIM/NIK dosen)
        const dosenId = req.user.userId; // Menggunakan userId dari JWT
        if (!dosenId) {
            console.error('Error: ID Dosen tidak ditemukan di req.user.userId. Pastikan middleware auth mengisi req.user.userId dengan benar.');
            return res.status(401).json({ error: 'Unauthorized: ID Dosen tidak ditemukan.' });
        }

        const { draw, start, length, search, order, columns } = req.query;
        const searchValue = search.value || '';

        let whereClause = {
            id_user: dosenId 
        };

        if (searchValue) {
            whereClause.OR = [
                { pendaftaran: { user: { id_user: { contains: searchValue } } } }, 
                { pendaftaran: { user: { nama_lengkap: { contains: searchValue, mode: 'insensitive' } } } },
                { pendaftaran: { judul: { contains: searchValue, mode: 'insensitive' } } },
                { status_semhas: { contains: searchValue, mode: 'insensitive' } },
            ];
        }
        
        // Hitung total records tanpa filter pencarian, hanya berdasarkan dosenId
        const totalRecords = await prisma.nilai_semhas.count({
            where: { id_user: dosenId }
        });

        // Hitung filtered records dengan filter pencarian
        const filteredRecords = await prisma.nilai_semhas.count({
            where: whereClause
        });

        // Tentukan orderBy - HANYA boleh kolom yang ada di model nilai_semhas atau relasi tingkat pertama yang didukung Prisma.
        let orderByClause = { id_rubik: 'desc' }; // Default sorting

        // Jika DataTables meminta sorting berdasarkan 'status' (yaitu 'status_semhas')
        if (order && order.length > 0) { // Pastikan ada order yang dikirim DataTables
            const orderColumnIndex = parseInt(order[0].column);
            const orderColumnData = columns[orderColumnIndex].data; // Dapatkan nama kolom dari 'data' di DataTables columns
            const orderDir = order[0].dir;

            if (orderColumnData === 'status') {
                orderByClause = { status_semhas: orderDir };
            } 
            // Abaikan orderBy untuk nim, nama, judul, tanggalSeminar karena kompleksitas join
            // atau memerlukan logic sorting di sisi aplikasi setelah data diambil.
        }


        // Query utama untuk mengambil data seminar
        const seminars = await prisma.nilai_semhas.findMany({
            where: whereClause, // Gunakan whereClause yang sudah benar
            include: {
                pendaftaran: {
                    select: {
                        judul: true, // Untuk Judul Penelitian
                        user: { // <-- Mendapatkan data MAHASISWA dari relasi pendaftaran
                            select: {
                                id_user: true,     // NIM Mahasiswa
                                nama_lengkap: true // Nama Mahasiswa
                            }
                        },
                        jadwal_pendaftaran: { // Join ke jadwal_pendaftaran
                            include: {
                                kuota_semhas: {
                                    select: {
                                        minggu: true // Waktu pelaksanaan (jika ada)
                                    }
                                },
                                jadwal_dosenDosen: { // Join ke jadwal_dosendosen
                                    select: {
                                        tanggal_data: true, // Tanggal pelaksanaan
                                        shift1: true,
                                        shift2: true,
                                        shift3: true,
                                        shift4: true,
                                        bidang_keahlian: true
                                    }
                                }
                            },
                            take: 1, 
                            orderBy: {
                                id_jadwal: 'desc' // Ambil jadwal terbaru
                            }
                        }
                    }
                }
            },
            orderBy: orderByClause, // Gunakan orderByClause yang sudah diperbaiki
            skip: parseInt(start) || 0,
            take: parseInt(length) || 10
        });

        // --- DEBUGGING: CETAK DATA DARI PRISMA KE KONSOL SERVER ---
        console.log('Data Seminars dari Prisma (revisi):', JSON.stringify(seminars, null, 2)); 
        // --- AKHIR DEBUGGING ---

        const data = seminars.map((seminar, index) => {
            // Ambil data Mahasiswa dari seminar.pendaftaran.user
            const nim = seminar.pendaftaran?.user?.id_user || '-'; 
            const nama = seminar.pendaftaran?.user?.nama_lengkap || '-'; 

            // Ambil Judul Penelitian dari seminar.pendaftaran
            const judul = seminar.pendaftaran?.judul || '-';
            
            // Ambil tanggal seminar dari jadwal_pendaftaran -> jadwal_dosenDosen
            let tanggalSeminar = '-';
            if (seminar.pendaftaran && 
                seminar.pendaftaran.jadwal_pendaftaran && 
                seminar.pendaftaran.jadwal_pendaftaran.length > 0) 
            {
                const jadwalDosen = seminar.pendaftaran.jadwal_pendaftaran[0].jadwal_dosenDosen;
                if (jadwalDosen && jadwalDosen.tanggal_data) {
                    tanggalSeminar = jadwalDosen.tanggal_data.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
                }
            }

            return {
                no: parseInt(start) + index + 1,
                nim: nim,
                nama: nama,
                judul: judul,
                // Berikan class pada status untuk styling di CSS
                status: `<span class="status-badge status-${seminar.status_semhas?.toLowerCase().replace(/\s+/g, '-') || 'baru'}">${seminar.status_semhas || 'Baru'}</span>`,
                tanggalSeminar: tanggalSeminar,
                actions: `
                    <div class="action-buttons">
                        <button onclick="viewDetail('${seminar.id_rubik}')" class="btn-detail">Detail</button>
                        <button onclick="updateStatus('${seminar.id_rubik}')" class="btn-update">Update</button>
                    </div>`
            };
        });

        res.json({
            draw: parseInt(draw),
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            data: data
        });
    } catch (error) {
        console.error('Error di getApiData:', error);
        res.status(500).json({ error: 'Gagal mengambil data: ' + error.message });
    }
};

// Mengupdate status seminar dari modal
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params; // id ini adalah id_rubik dari nilai_semhas
        const { status, catatan } = req.body;

        // --- VALIDASI INPUT ---
        if (!id) {
            return res.status(400).json({ success: false, message: 'ID seminar tidak boleh kosong.' });
        }
        if (!status) {
            return res.status(400).json({ success: false, message: 'Silakan pilih status terlebih dahulu.' });
        }
        if (catatan && catatan.length > 500) {
            return res.status(400).json({ success: false, message: 'Catatan terlalu panjang (maks. 500 karakter).' });
        }
        // --- AKHIR VALIDASI INPUT ---

        const updatedSeminar = await prisma.nilai_semhas.update({
            where: { id_rubik: id }, // Menggunakan id_rubik sebagai primary key untuk update
            data: { 
                status_semhas: status, // Update kolom status_semhas
                komentar: catatan      // Update kolom komentar
            }
        });

        res.json({ success: true, message: 'Status seminar berhasil diperbarui!', data: updatedSeminar });
    } catch (error) {
        console.error("Gagal memperbarui status:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Seminar dengan ID tersebut tidak ditemukan.' });
        }
        res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server saat memperbarui status: ' + error.message });
    }
};

// Fungsi untuk menampilkan halaman detail seminar
exports.detail = async (req, res) => {
    try {
        const { id } = req.params; // id ini adalah id_rubik dari nilai_semhas
        
        if (!id) {
            return res.status(400).send('ID Seminar tidak ditemukan.');
        }

        // Ambil data detail nilai_semhas beserta semua relasinya
        const seminarDetail = await prisma.nilai_semhas.findUnique({
            where: { id_rubik: id },
            include: {
                // Info Dosen Penguji (dari nilai_semhas.id_user)
                user: { // Ini adalah relasi ke user (dosen penguji)
                    select: {
                        id_user: true, // NIK Dosen
                        nama_lengkap: true, // Nama Dosen
                        email: true
                    }
                },
                pendaftaran: {
                    select: {
                        judul: true,
                        bidang_penelitian: true,
                        nama_dosen: true, // Nama Dosen Pembimbing (dari pendaftaran)
                        status: true, // Status pendaftaran
                        nama_laporan: true, // Nama file laporan
                        nama_krs: true, // Nama file KRS
                        nama_pengesahan: true, // Nama file pengesahan
                        nama_ppt: true, // Nama file PPT
                        periode_semhas: { // Detail periode seminar
                            select: {
                                semester: true,
                                tanggal_buka: true,
                                tanggal_tutup: true
                            }
                        },
                        user: { // Ini adalah relasi ke user (mahasiswa)
                            select: {
                                id_user: true, // NIM Mahasiswa
                                nama_lengkap: true, // Nama Mahasiswa
                                email: true
                            }
                        },
                        jadwal_pendaftaran: { // Jadwal spesifik pendaftaran ini
                            include: {
                                kuota_semhas: {
                                    select: {
                                        minggu: true // Waktu pelaksanaan (jika ada)
                                    }
                                },
                                jadwal_dosenDosen: {
                                    select: {
                                        tanggal_data: true, // Tanggal pelaksanaan
                                        shift1: true,
                                        shift2: true,
                                        shift3: true,
                                        shift4: true,
                                        bidang_keahlian: true
                                    }
                                }
                            },
                            take: 1, // Ambil satu jadwal paling relevan
                            orderBy: { id_jadwal: 'desc' }
                        }
                    }
                },
                rubik: { // Detail rubik penilaian
                    select: {
                        pemahaman: true,
                        dokumenasi: true,
                        presentasi: true,
                        ketepatan_waktu: true,
                        sikap: true
                    }
                }
            }
        });

        if (!seminarDetail) {
            return res.status(404).send('Detail seminar tidak ditemukan.');
        }

        // Render halaman detail EJS dan kirim data
        res.render('dosen/detailseminar', {
            title: 'Detail Seminar',
            user: req.user, // Informasi user yang login
            seminar: seminarDetail // Data detail seminar yang diambil
        });

    } catch (error) {
        console.error('Error fetching seminar detail:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil detail seminar.');
    }
};

// Fungsi lain yang mungkin ingin Anda kembangkan nanti (exports.exportData tetap ada)
exports.exportData = (req, res) => { res.send('Fitur export sedang dikembangkan.'); };