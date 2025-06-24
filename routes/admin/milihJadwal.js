// routes/admin/milihJadwal.js
const express = require('express');
const router = express.Router();
const AdminController = require('../../controllers/admin/milihJadwal');

// Route untuk menampilkan halaman EJS dan mengambil data mahasiswa (untuk UI)
router.get('/admin/mahasiswa', async (req, res, next) => {
  try {
    if (req.query.json === 'true') {
      return AdminController.getMahasiswa(req, res, next);  // API untuk data JSON
    }
    
    const mahasiswaData = await AdminController.getMahasiswaForPage(req, res, next);
    res.render('admin/milihJadwal', {
      title: 'Penjadwalan Seminar Hasil',
      mahasiswa: mahasiswaData  // Kirim data mahasiswa untuk ditampilkan di halaman EJS
    });
  } catch (error) {
    console.error('Error in /admin/mahasiswa route:', error);
    next(error);
  }
});

// Route untuk mendapatkan daftar dosen
router.get('/admin/dosen', AdminController.getDosen);

// Route untuk mendapatkan jadwal dosen berdasarkan id dosen
router.get('/admin/jadwal', AdminController.getJadwalDosen);

// Route untuk mendapatkan detail shift berdasarkan jadwal_id
router.get('/admin/shift', AdminController.getShiftDetails);

// Route untuk menetapkan/update jadwal seminar hasil (semhas) untuk mahasiswa
router.post('/admin/set-jadwal', AdminController.setJadwalSemhas);

// Route tambahan: untuk mendapatkan detail jadwal mahasiswa tertentu (opsional)
router.get('/admin/mahasiswa/:id/jadwal', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const jadwalMahasiswa = await prisma.jadwal_pendaftaran.findFirst({
      where: {
        id_pendaftaran: Number(id)
      },
      include: {
        pendaftaran: {
          include: {
            user: {
              select: {
                nama_lengkap: true
              }
            }
          }
        },
        user: {
          select: {
            nama_lengkap: true
          }
        }
      }
    });

    if (!jadwalMahasiswa) {
      return res.status(404).json({
        message: 'Jadwal mahasiswa tidak ditemukan'
      });
    }

    res.json({
      id_jadwal: jadwalMahasiswa.id_jadwal,
      id_pendaftaran: jadwalMahasiswa.id_pendaftaran,
      nama_mahasiswa: jadwalMahasiswa.pendaftaran.user.nama_lengkap,
      dosen_penguji: jadwalMahasiswa.dosen_penguji,
      tanggal_semhas: jadwalMahasiswa.tanggal_semhas,
      jadwal_semhas: jadwalMahasiswa.jadwal_semhas,
      status: jadwalMahasiswa.status
    });
  } catch (error) {
    console.error('Error getting jadwal mahasiswa:', error);
    res.status(500).json({
      message: 'Gagal mengambil jadwal mahasiswa',
      error: error.message
    });
  }
});

// Route tambahan: untuk menghapus jadwal mahasiswa (opsional)
router.delete('/admin/mahasiswa/:id/jadwal', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Cari jadwal yang akan dihapus
    const existingJadwal = await prisma.jadwal_pendaftaran.findFirst({
      where: {
        id_pendaftaran: Number(id)
      }
    });

    if (!existingJadwal) {
      return res.status(404).json({
        message: 'Jadwal tidak ditemukan'
      });
    }

    // Kembalikan status shift ke "Tersedia"
    const shiftJam = existingJadwal.jadwal_semhas;
    let shiftId;
    
    switch (shiftJam) {
      case '08:00 - 10:00':
        shiftId = 'shift1';
        break;
      case '10:00 - 12:00':
        shiftId = 'shift2';
        break;
      case '12:00 - 15:00':
        shiftId = 'shift3';
        break;
      case '15:00 - 17:00':
        shiftId = 'shift4';
        break;
    }

    if (shiftId && existingJadwal.id_jadwal_dosen) {
      const restoreData = {};
      restoreData[shiftId] = "Tersedia";
      
      await prisma.jadwal_dosendosen.update({
        where: { id_jadwal_dosen: existingJadwal.id_jadwal_dosen },
        data: restoreData
      });
    }

    // Hapus jadwal pendaftaran
    await prisma.jadwal_pendaftaran.delete({
      where: {
        id_jadwal: existingJadwal.id_jadwal
      }
    });

    res.json({
      message: 'Jadwal berhasil dihapus dan slot waktu dikembalikan'
    });
  } catch (error) {
    console.error('Error deleting jadwal:', error);
    res.status(500).json({
      message: 'Gagal menghapus jadwal',
      error: error.message
    });
  }
});

module.exports = router;