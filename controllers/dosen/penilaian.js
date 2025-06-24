// Lokasi: controllers/dosen/penilaian.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const puppeteer = require('puppeteer'); // <-- Tambah ini
// const path = require('path');           // <-- Tambah ini
// const ejs = require('ejs');             // <-- Tambah ini

// Definisi Kriteria Penilaian dan Bobotnya (HARDCODED)
const daftarKriteriaPenilaian = [
    { id: 'pemahaman', nama: 'Pemahaman Materi', bobot: 0.20 },
    { id: 'dokumenasi', nama: 'Dokumentasi & Laporan', bobot: 0.20 },
    { id: 'presentasi', nama: 'Presentasi', bobot: 0.20 },
    { id: 'ketepatan_waktu', nama: 'Ketepatan Waktu', bobot: 0.20 },
    { id: 'sikap', nama: 'Sikap', bobot: 0.20 }
];

// 1. Render halaman penilaian
const renderPenilaianPage = async (req, res) => {
    try {
        if (!req.user || !req.user.userId || !req.user.nama_lengkap || req.user.role !== 'DOSEN') {
            console.error('Error: User data missing, userId not found, or not a DOSEN. req.user:', req.user);
            return res.status(403).send('Akses Ditolak: Data pengguna tidak valid atau bukan Dosen.');
        }

        const dosenNamaLengkap = req.user.nama_lengkap;
        const dosenId = req.user.userId; // NIP Dosen

        console.log('DEBUG: Nama Dosen dari JWT:', dosenNamaLengkap);
        console.log('DEBUG: Dosen Login ID:', dosenId);

        const pendaftaranRecords = await prisma.pendaftaran.findMany({
            where: {
                
                
                // Tambahkan filter ini jika hanya ingin pendaftaran yang sudah punya jadwal_pendaftaran
                jadwal_pendaftaran: {
                    some: {
                        dosen_penguji: dosenNamaLengkap // Memastikan dosen yang login adalah penguji di jadwal_pendaftaran
                    }
                }
            },
            include: {
                user: { // Meng-include data user (mahasiswa) yang terkait dengan pendaftaran ini
                    select: {
                        id_user: true,      // ID Mahasiswa
                        nama_lengkap: true, // Nama Mahasiswa
                    }
                },
                // Include jadwal_pendaftaran untuk mendapatkan id_pendaftaran unik
                jadwal_pendaftaran: {
                    select: {
                        id_jadwal: true, // Perlu id_jadwal untuk filter jika ada relasi di nilai_semhas
                        dosen_penguji: true // Untuk konfirmasi di loop
                    }
                }
            },
            orderBy: {
                user: { // Urutkan berdasarkan nama mahasiswa
                    nama_lengkap: 'asc'
                }
            }
        });

        console.log('DEBUG: Pendaftaran Records untuk Dosen (dari Prisma query):', JSON.stringify(pendaftaranRecords, null, 2));

        const finalDaftarMahasiswa = [];
        const processedPendaftaranIds = new Set(); // Set untuk menghindari duplikasi jika ada beberapa jadwal_pendaftaran untuk satu pendaftaran

        for (const pendaftaran of pendaftaranRecords) {
            const student = pendaftaran.user; // Ini adalah objek mahasiswa

            // Pastikan mahasiswa ada dan pendaftaran ini valid untuk dinilai oleh dosen ini
            const isDosenPengujiValid = pendaftaran.jadwal_pendaftaran.some(
                jp => jp.dosen_penguji === dosenNamaLengkap
            );

            // Pastikan tidak ada duplikasi pendaftaran untuk siswa yang sama
            if (student && isDosenPengujiValid && !processedPendaftaranIds.has(pendaftaran.id_pendaftaran)) {
                
                // Cek apakah nilai untuk pendaftaran ini sudah ada dari dosen yang login
                 const existingNilai = await prisma.nilai_semhas.findFirst({
                  where: {
                        id_pendaftaran: pendaftaran.id_pendaftaran,
                        id_user: dosenId // Dosen ID (NIP) dari yang login
                    }
                });

                finalDaftarMahasiswa.push({
                    // PERBAIKAN DI SINI: Gunakan 'student' BUKAN 'mhs'
                    id_user: student.id_user,             // ID Mahasiswa untuk value option
                    nama_lengkap: student.nama_lengkap,   // Nama Mahasiswa untuk tampilan
                    id_pendaftaran: pendaftaran.id_pendaftaran, // ID Pendaftaran spesifik
                    judul: pendaftaran.judul,             // Judul penelitian dari pendaftaran
                    isDinilai: !!existingNilai            // Status sudah dinilai
                });
                processedPendaftaranIds.add(pendaftaran.id_pendaftaran); // Tandai pendaftaran ini sudah diproses
            }
        }


        console.log('DEBUG: Final Daftar Mahasiswa (yang akan dikirim ke EJS):', JSON.stringify(finalDaftarMahasiswa, null, 2));

        res.render('dosen/penilaian', {
            title: 'Penilaian Seminar',
            user: req.user,
            penilaian: daftarKriteriaPenilaian,
            mahasiswas: finalDaftarMahasiswa // Kirim data mahasiswa ke EJS
        });

    } catch (error) {
        console.error("Gagal memuat halaman penilaian:", error);
        res.status(500).send("Tidak dapat memuat halaman penilaian.");
    }
};
// ... (fungsi submitPenilaian dan getExistingNilai di bawahnya tetap sama) ...

// 2. Simpan penilaian
const submitPenilaian = async (req, res) => {
    try {
        const { mahasiswaId, scores, status_semhas, komentar } = req.body;

        if (!req.user || !req.user.userId || req.user.role !== 'DOSEN') {
            console.error('Error: User data missing, or not a DOSEN. req.user:', req.user);
            return res.status(403).json({ message: 'Akses Ditolak: Data pengguna tidak valid atau bukan Dosen.' });
        }
        const dosenId = req.user.userId;

        if (!mahasiswaId || !scores) {
            return res.status(400).json({ message: "Data penilaian tidak lengkap." });
        }

        const pendaftaranMahasiswa = await prisma.pendaftaran.findFirst({
            where: { id_user: mahasiswaId },
            select: { id_pendaftaran: true }
        });

        if (!pendaftaranMahasiswa) {
            return res.status(404).json({ message: "Pendaftaran mahasiswa tidak ditemukan." });
        }

        const id_pendaftaran = pendaftaranMahasiswa.id_pendaftaran;

        const rubikData = {
            pemahaman: String(scores.pemahaman || ''),
            dokumenasi: String(scores.dokumenasi || ''), // Sudah dikoreksi ejaannya
            presentasi: String(scores.presentasi || ''),
            ketepatan_waktu: String(scores.ketepatan_waktu || ''),
            sikap: String(scores.sikap || ''),
            id_pendaftaran: id_pendaftaran
        };

        let existingRubik = await prisma.rubik.findFirst({
            where: { id_pendaftaran: id_pendaftaran }
        });

        let rubikIdForComment;
        if (existingRubik) {
            await prisma.rubik.update({
                where: { id_rubik: existingRubik.id_rubik },
                data: rubikData
            });
            rubikIdForComment = existingRubik.id_rubik;
        } else {
            const newRubikId = `rubik-${Date.now()}-${id_pendaftaran}`;
            const createdRubik = await prisma.rubik.create({
                data: {
                    id_rubik: newRubikId,
                    ...rubikData
                }
            });
            rubikIdForComment = createdRubik.id_rubik;
        }

        let existingNilaiSemhas = await prisma.nilai_semhas.findFirst({
            where: {
                id_rubik: rubikIdForComment,
                id_pendaftaran: id_pendaftaran,
                id_user: dosenId
            }
        });

        if (existingNilaiSemhas) {
            await prisma.nilai_semhas.update({
                where: { id_rubik: existingNilaiSemhas.id_rubik },
                data: {
                    status_semhas: status_semhas,
                    komentar: komentar,
                    // HAPUS BARIS INI: waktu_input: new Date(),
                    id_user: dosenId
                }
            });
        } else {
            await prisma.nilai_semhas.create({
                data: {
                    id_rubik: rubikIdForComment,
                    id_pendaftaran: id_pendaftaran,
                    status_semhas: status_semhas,
                    komentar: komentar,
                    // HAPUS BARIS INI: waktu_input: new Date(),
                    id_user: dosenId
                }
            });
        }

        res.status(200).json({ message: 'Penilaian berhasil disimpan.' });

    } catch (error) {
        console.error('Gagal menyimpan penilaian:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan penilaian.' });
    }
};

// 3. Ambil nilai yang sudah pernah dinilai oleh dosen
const getExistingNilai = async (req, res) => {
    try {
        const { mahasiswaId } = req.params;

        if (!req.user || !req.user.userId || req.user.role !== 'DOSEN') {
            console.error('Error: User data missing, or not a DOSEN. req.user:', req.user);
            return res.status(403).json({ error: "Akses Ditolak: Data pengguna tidak valid atau bukan Dosen." });
        }
        const dosenId = req.user.userId;

        if (!mahasiswaId) {
            return res.status(400).json({ error: "Parameter mahasiswaId diperlukan." });
        }

        const pendaftaranMahasiswa = await prisma.pendaftaran.findFirst({
            where: { id_user: mahasiswaId },
            select: { id_pendaftaran: true }
        });

        if (!pendaftaranMahasiswa) {
            return res.status(404).json({ error: "Pendaftaran mahasiswa tidak ditemukan." });
        }

        const id_pendaftaran = pendaftaranMahasiswa.id_pendaftaran;

        const scores = await prisma.rubik.findFirst({
            where: { id_pendaftaran: id_pendaftaran },
            select: {
                pemahaman: true,
                dokumenasi: true, // Sudah dikoreksi ejaannya
                presentasi: true,
                ketepatan_waktu: true,
                sikap: true,
                id_rubik: true // Sudah dikoreksi
            }
        });

        const commentData = await prisma.nilai_semhas.findFirst({
            where: {
                id_pendaftaran: id_pendaftaran,
                id_user: dosenId
            },
            select: {
                status_semhas: true,
                komentar: true
            }
        });

        res.json({
            scores: scores ? {
                pemahaman: parseFloat(scores.pemahaman || 0),
                dokumenasi: parseFloat(scores.dokumenasi || 0), // Sudah dikoreksi ejaannya
                presentasi: parseFloat(scores.presentasi || 0),
                ketepatan_waktu: parseFloat(scores.ketepatan_waktu || 0),
                sikap: parseFloat(scores.sikap || 0)
            } : null,
            commentData: commentData || null
        });

    } catch (error) {
        console.error('DEBUG_GET_EXISTING_NILAI: Gagal mengambil nilai:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil nilai.' });
    }
};

module.exports = {
    renderPenilaianPage,
    submitPenilaian,
    getExistingNilai
};