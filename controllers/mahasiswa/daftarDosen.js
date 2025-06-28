const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDaftarDosen = async (req, res) => {
  try {
    const daftarDosen = await prisma.jadwal_dosendosen.findMany({
     
      select: {
        bidang_keahlian: true,
        tanggal_data: true,
        shift1: true,
        shift2: true,
        shift3: true,
        shift4: true,
        user: {
          select: {
            id_user: true,
            nama_lengkap: true
          }
        }
      }
    });

    res.render('mahasiswa/daftarDosen', { daftarDosen: daftarDosen });
  } catch (error) {
    console.error("Gagal mengambil daftar dosen:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil daftar dosen." });
  }
};
