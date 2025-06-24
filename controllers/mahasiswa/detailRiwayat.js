const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRiwayatSemhas(req, res) {
  try {
    const { id } = req.params; // Mendapatkan ID seminar dari URL parameter

    // Periksa apakah id valid dan bukan undefined atau kosong
    if (!id) {
      return res.status(400).send('ID seminar tidak valid');
    }

    // Ambil data pendaftaran berdasarkan ID seminar
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: parseInt(id) },  // ID seminar yang dipilih
      select: {
        id_user: true,
        judul: true,
        nama_dosen: true,
        id_pendaftaran: true,
      },
    });

    if (!pendaftaran) {
      return res.status(404).send('Seminar tidak ditemukan');
    }

    // Ambil nama lengkap pengguna berdasarkan id_user dari tabel user
    const user = await prisma.user.findUnique({
      where: { id_user: pendaftaran.id_user },
      select: {
        nama_lengkap: true,  // Ambil nama lengkap pengguna
      },
    });

    if (!user) {
      return res.status(404).send('User tidak ditemukan');
    }

    // Ambil status dari tabel nilai_semhas berdasarkan id_pendaftaran
    const nilaiSemhas = await prisma.nilai_semhas.findFirst({
      where: { id_pendaftaran: parseInt(id) },
      select: {
        status_semhas: true,
      },
    });

    // Ambil jadwal pendaftaran berdasarkan id_pendaftaran
    const jadwal_pendaftaran = await prisma.jadwal_pendaftaran.findFirst({
      where: { id_pendaftaran: parseInt(id) },
      select: {
        dosen_penguji: true,
      },
    });

    // Tentukan status yang akan ditampilkan
    let status = 'Belum dinilai'; // Default status jika belum ada nilai
    if (nilaiSemhas && nilaiSemhas.status_semhas) {
      status = nilaiSemhas.status_semhas;
    }

    // Menangani kondisi ketika jadwal_pendaftaran belum ada
    if (!jadwal_pendaftaran) {
      return res.render('mahasiswa/detailRiwayat', {
        judul: pendaftaran.judul,
        nama_dosen: pendaftaran.nama_dosen,
        nama_lengkap: user.nama_lengkap,
        nim: pendaftaran.id_user,
        status: status, // Menggunakan status dari nilai_semhas
        id_pendaftaran: pendaftaran.id_pendaftaran,
        dosen_penguji: 'Jadwal belum tersedia',  // Menampilkan pesan jika jadwal belum ada
      });
    }

    // Kirim data ke view (EJS) jika jadwal_pendaftaran tersedia
    res.render('mahasiswa/detailRiwayat', {
      judul: pendaftaran.judul,
      nama_dosen: pendaftaran.nama_dosen,
      nama_lengkap: user.nama_lengkap,
      nim: pendaftaran.id_user,
      status: status, // Menggunakan status dari nilai_semhas
      id_pendaftaran: pendaftaran.id_pendaftaran,
      dosen_penguji: jadwal_pendaftaran.dosen_penguji,
    });

  } catch (error) {
    console.error("Error fetching seminar detail:", error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data');
  }
}

module.exports = { getRiwayatSemhas };