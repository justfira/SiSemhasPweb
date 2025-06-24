const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDaftarDosen = async (req, res) => {
    try {
        // 1. Ambil daftar dosen_penguji unik dari jadwal_pendaftaran
        // ASUMSI: kolom dosen_penguji di jadwal_pendaftaran menyimpan id_user (integer)
        const pengujiList = await prisma.jadwal_pendaftaran.findMany({
            distinct: ['dosen_penguji'],
            select: {
                dosen_penguji: true // Ini akan mengembalikan { dosen_penguji: <id> }
            }
        });

        // 2. Ambil info user dosen dan bidang keahlian
        const daftarDosen = await Promise.all(pengujiList.map(async (penguji) => {
            // Pastikan penguji.dosen_penguji benar-benar adalah ID user
           const user = await prisma.user.findFirst({
    where: {
        nama_lengkap: penguji.dosen_penguji, // Cari berdasarkan nama lengkap
        role: 'dosen'
    },
    select: {
        id_user: true,
        nama_lengkap: true
    }
});
            if (!user) return null; // Jika user tidak ditemukan atau bukan dosen

            const bidang = await prisma.jadwal_dosendosen.findFirst({
                where: {
                    id_user: user.id_user // Menggunakan id_user yang ditemukan
                },
                orderBy: {
                    tanggal_data: 'desc' // Ambil bidang terbaru jika ada banyak
                },
                select: {
                    bidang_keahlian: true
                }
            });

            // Ini adalah objek yang akan dimasukkan ke array daftarDosen
            return {
                nama_lengkap: user.nama_lengkap,
                bidang_keahlian: bidang?.bidang_keahlian || '-' // Gunakan optional chaining dan fallback
            };
        }));

        // Filter null (jika ada user yang tidak ditemukan)
        const dosenFinal = daftarDosen.filter(item => item !== null);

        // Kirim ke EJS
        // Nama variabel di EJS akan menjadi 'daftarDosen'
        res.render('mahasiswa/daftarDosen', { daftarDosen: dosenFinal });
    } catch (error) {
        console.error('ERROR GET DOSEN:', error);
        res.status(500).send('Terjadi kesalahan dalam mengambil daftar dosen');
    }
};