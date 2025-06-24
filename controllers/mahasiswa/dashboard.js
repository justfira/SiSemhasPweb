// controllers/mahasiswa/dashboard.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFormDashboard = async (req, res) => {
  try {
    const user = req.user;  // Mengambil data pengguna yang sudah didecode dari JWT

    // Jika tidak ada user atau nama lengkap, kirimkan error
    if (!user || !user.nama_lengkap) {
      return res.status(400).send('User tidak ditemukan');
    }

    // Ambil data seminar yang berisi judul dari pendaftaran
    const pendaftaranList = await prisma.pendaftaran.findMany({
      where: {
        nama_laporan: {
          not: null, // Pastikan nama_laporan tidak null
        }
      },
      select: {
        id_pendaftaran: true, // ID seminar
        judul: true, // Judul seminar
      },
      orderBy: {
        id_pendaftaran: 'desc', // Urutkan berdasarkan id_pendaftaran jika perlu
      }
    });

    // Cek jika tidak ada data seminar
    if (pendaftaranList.length === 0) {
      return res.render('mahasiswa/dashboardMhs', {
        nama_lengkap: user.nama_lengkap,
        emptyState: true,
      });
    }

    // Ambil status dari tabel nilai_semhas untuk setiap pendaftaran
    const riwayat = await Promise.all(
      pendaftaranList.map(async (pendaftaran) => {
        // Cari status di tabel nilai_semhas berdasarkan id_pendaftaran
        const nilaiSemhas = await prisma.nilai_semhas.findFirst({
          where: { id_pendaftaran: pendaftaran.id_pendaftaran },
          select: {
            status_semhas: true,
          },
        });

        return {
          id_pendaftaran: pendaftaran.id_pendaftaran,
          judul: pendaftaran.judul,
          status: nilaiSemhas ? nilaiSemhas.status_semhas : 'Belum dinilai', // Status dari nilai_semhas atau default
        };
      })
    );

    // Kirim data seminar ke halaman dashboard
    res.render('mahasiswa/dashboardMhs', {
      nama_lengkap: user.nama_lengkap,
      riwayat,
      emptyState: false,
    });

  } catch (error) {
    console.error('ERROR GET DASHBOARD:', error);
    return res.status(500).send('Terjadi kesalahan dalam dashboard');
  }
};