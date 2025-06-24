const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createEvaluation = async (req, res) => {
    try {
        // Ambil data dari form HTML dengan NAMA KOLOM BARU
        const { fitur, konten, responsif, kemudahan, dokumentasi, kritik, saran } = req.body; // <<< NAMA-NAMA BARU

        // Validasi rating (pastikan semua ada dan dalam range 1-5)
        // Kita bisa menggunakan array baru yang sesuai dengan nama properti di req.body
        const ratings = [fitur, konten, responsif, kemudahan, dokumentasi];
        const ratingNames = ['fitur', 'konten', 'responsif', 'kemudahan', 'dokumentasi']; // Untuk pesan error lebih spesifik

        for (let i = 0; i < ratings.length; i++) {
            const ratingValue = parseInt(ratings[i]);
            if (!ratings[i] || isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                return res.status(400).json({
                    message: `Rating untuk ${ratingNames[i]} harus diisi dengan nilai 1-5.`
                });
            }
        }

        // Simpan data evaluasi ke database (tanpa NIM, dengan nama kolom baru)
        const newEvaluation = await prisma.evaluasi_sistem.create({
            data: {
                // Gunakan nama kolom baru di sini
                fitur: parseInt(fitur), // Nama properti yang diterima dari frontend
                konten: parseInt(konten),
                responsif: parseInt(responsif),
                kemudahan: parseInt(kemudahan),
                dokumentasi: parseInt(dokumentasi),
                kritik: kritik || '', // Jika kosong, isi dengan string kosong
                saran: saran || '',   // Jika kosong, isi dengan string kosong
                // createdAt akan otomatis diisi oleh @default(now())
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Evaluasi sistem berhasil disimpan secara anonim.',
            data: {
                id: newEvaluation.id, // Nama ID juga berubah menjadi 'id'
                ratings: {
                    fitur: newEvaluation.fitur,
                    konten: newEvaluation.konten,
                    responsif: newEvaluation.responsif,
                    kemudahan: newEvaluation.kemudahan,
                    dokumentasi: newEvaluation.dokumentasi,
                },
                kritik: newEvaluation.kritik,
                saran: newEvaluation.saran,
                createdAt: newEvaluation.createdAt // Nama tanggal isi juga berubah
            }
        });

    } catch (error) {
        console.error('Error saat menyimpan evaluasi sistem:', error);
        
        // Error P2002 (unique constraint) mungkin tidak lagi relevan tanpa NIM dan tanpa unique constraint lain
        // Jika ada unique constraint lain di tabel evaluasi_sistem, pertahankan ini
        if (error.code === 'P2002') {
            return res.status(409).json({
                message: 'Terjadi konflik data (mungkin unique constraint terlanggar).'
            });
        }

        return res.status(500).json({
            message: 'Terjadi kesalahan server saat menyimpan evaluasi.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Fungsi untuk mendapatkan semua evaluasi
const getAllEvaluations = async (req, res) => {
    try {
        const evaluations = await prisma.evaluasi_sistem.findMany({
            orderBy: {
                createdAt: 'desc' // Urutkan berdasarkan createdAt
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Data evaluasi berhasil diambil.',
            data: evaluations
        });

    } catch (error) {
        console.error('Error saat mengambil data evaluasi:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan server saat mengambil data evaluasi.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Fungsi getEvaluationByNim DIHAPUS SEPENUHNYA karena tidak ada NIM lagi
// dan tidak masuk akal untuk mencari evaluasi anonim berdasarkan NIM
// Jika Anda memang punya fungsi ini di router, hapus juga panggilannya di sana.
// const getEvaluationByNim = async (req, res) => { /* ... */ };

module.exports = {
    createEvaluation,
    getAllEvaluations,
    // getEvaluationByNim // Hapus dari export juga
};