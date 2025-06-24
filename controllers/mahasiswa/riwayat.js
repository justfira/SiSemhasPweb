const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRiwayatSemhas(req, res) {
  try {
    // Ambil data pendaftaran di mana nama_laporan tidak null
    const riwayat = await prisma.pendaftaran.findMany({
      where: {
        nama_laporan: {
          not: null // Pastikan nama_laporan tidak null
        }
      },
      select: {
        id_pendaftaran: true, // Memastikan ID seminar ada
        judul: true // Pilih hanya kolom 'judul' untuk ditampilkan
      },
      orderBy: {
        id_pendaftaran: 'desc' // Urutkan berdasarkan id_pendaftaran, jika perlu
      }
    });

    // Cek jika tidak ada data
    if (riwayat.length === 0) {
      return res.render('mahasiswa/riwayatseminar', { emptyState: true });
    }

    // Render data riwayat semhas ke halaman riwayatseminar
    res.render('mahasiswa/riwayatseminar', { riwayat, emptyState: false });
  } catch (error) {
    console.error("Error fetching riwayat semhas:", error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data');
  }
}

module.exports = { getRiwayatSemhas };
