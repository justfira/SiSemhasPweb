const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fungsi untuk menampilkan semua jadwal semhas (untuk mahasiswa datang ke semhas)
async function getAllJadwalSemhas(req, res) {
  try {
    console.log("=== Mengambil semua jadwal semhas ===");
    
    // Ambil semua data jadwal_pendaftaran yang sudah terjadwal
    const jadwalSemhas = await prisma.jadwal_pendaftaran.findMany({
      where: {
        // Hanya yang sudah memiliki jadwal dan tanggal
        AND: [
          { jadwal_semhas: { not: null } },
          { tanggal_semhas: { not: null } }
        ]
      },
      include: {
        pendaftaran: {
          include: {
            user: true  // Include data mahasiswa
          }
        },
        jadwal_dosenDosen: {
          include: {
            user: true  // Include data dosen jika ada
          }
        }
      },
      orderBy: [
        { tanggal_semhas: 'asc' },  // Urutkan berdasarkan tanggal
        { jadwal_semhas: 'asc' }    // Kemudian berdasarkan jam
      ]
    });
    
    console.log(`Ditemukan ${jadwalSemhas.length} jadwal semhas`);

    if (!jadwalSemhas || jadwalSemhas.length === 0) {
      return res.render('mahasiswa/detailJadwal', {
        jadwalList: [],
        message: 'Belum ada jadwal seminar hasil yang tersedia saat ini'
      });
    }

    // Format data untuk ditampilkan
    const formattedJadwal = jadwalSemhas.map(jadwal => ({
      id_jadwal: jadwal.id_jadwal,
      id_pendaftaran: jadwal.id_pendaftaran,
      judul: jadwal.pendaftaran?.judul || 'Tidak ada judul',
      nama_mahasiswa: jadwal.pendaftaran?.user?.nama_lengkap || 'Tidak diketahui',
      nim: jadwal.pendaftaran?.user?.id_user || '-',
      dosen_penguji: jadwal.dosen_penguji || 'Belum ditentukan',
      jadwal_semhas: jadwal.jadwal_semhas,
      tanggal_semhas: jadwal.tanggal_semhas,
      status: jadwal.status || 'Terjadwal',
      bidang_penelitian: jadwal.pendaftaran?.bidang_penelitian || '-'
    }));

    console.log("Data jadwal berhasil diformat");

    // Render ke halaman detail jadwal semhas
    res.render('mahasiswa/detailJadwal', {
      jadwalList: formattedJadwal,
      message: null
    });

  } catch (error) {
    console.error("Error fetching semua jadwal semhas:", error);
    res.status(500).render('mahasiswa/detailJadwal', {
      jadwalList: [],
      message: 'Terjadi kesalahan dalam mengambil data jadwal seminar hasil: ' + error.message
    });
  }
}

// Fungsi untuk mendapatkan detail jadwal berdasarkan ID pendaftaran (opsional - jika masih diperlukan)
async function getJadwal(req, res) {
  try {
    const { id } = req.params;
    
    // Jika tidak ada ID, redirect ke semua jadwal
    if (!id) {
      return getAllJadwalSemhas(req, res);
    }

    // Validasi ID
    if (isNaN(parseInt(id))) {
      return res.status(400).render('mahasiswa/detailJadwal', {
        jadwalList: [],
        message: 'ID pendaftaran tidak valid'
      });
    }

    // Ambil data jadwal_pendaftaran berdasarkan ID pendaftaran
    const jadwalPendaftaran = await prisma.jadwal_pendaftaran.findFirst({
      where: {
        id_pendaftaran: parseInt(id),
      },
      include: {
        pendaftaran: {
          include: {
            user: true
          }
        },
        jadwal_dosenDosen: {
          include: {
            user: true
          }
        }
      }
    });

    if (!jadwalPendaftaran) {
      return res.status(404).render('mahasiswa/detailJadwal', {
        jadwalList: [],
        message: 'Jadwal seminar dengan ID pendaftaran tersebut tidak ditemukan'
      });
    }

    // Format data untuk single jadwal
    const formattedJadwal = [{
      id_jadwal: jadwalPendaftaran.id_jadwal,
      id_pendaftaran: jadwalPendaftaran.id_pendaftaran,
      judul: jadwalPendaftaran.pendaftaran?.judul || 'Tidak ada judul',
      nama_mahasiswa: jadwalPendaftaran.pendaftaran?.user?.nama_lengkap || 'Tidak diketahui',
      nim: jadwalPendaftaran.pendaftaran?.user?.id_user || '-',
      dosen_penguji: jadwalPendaftaran.dosen_penguji || 'Belum ditentukan',
      jadwal_semhas: jadwalPendaftaran.jadwal_semhas || 'Belum ditentukan',
      tanggal_semhas: jadwalPendaftaran.tanggal_semhas,
      status: jadwalPendaftaran.status || 'Menunggu',
      bidang_penelitian: jadwalPendaftaran.pendaftaran?.bidang_penelitian || '-'
    }];

    res.render('mahasiswa/detailJadwal', {  
      jadwalList: formattedJadwal,
      message: null
    });
  } catch (error) {
    console.error("Error fetching jadwal seminar:", error);
    res.status(500).render('mahasiswa/detailJadwal', {
      jadwalList: [],
      message: 'Terjadi kesalahan dalam mengambil data jadwal'
    });
  }
}

// Export fungsi
module.exports = { 
  getJadwal, 
  getAllJadwalSemhas,
  getDetailJadwalSemhas: getAllJadwalSemhas  // Alias untuk backward compatibility
};