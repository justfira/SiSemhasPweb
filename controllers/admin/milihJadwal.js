const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mendapatkan daftar mahasiswa yang sudah mengisi nama_laporan dalam format JSON
async function getMahasiswa(req, res, next) {
  try {
    const daftar = await prisma.pendaftaran.findMany({
      where: {
        nama_laporan: { not: null }
      },
      select: {
        id_pendaftaran: true,
        nama_laporan: true,
        bidang_penelitian: true,
        judul: true,
        user: {
          select: {
            nama_lengkap: true
          }
        },
        // Tambahkan relasi ke jadwal_pendaftaran untuk cek status
        jadwal_pendaftaran: {
          select: {
            id_jadwal: true,
            jadwal_semhas: true,
            tanggal_semhas: true,
            dosen_penguji: true,
            status: true
          }
        }
      }
    });

    const mahasiswa = daftar.map(item => ({
      id_pendaftaran: item.id_pendaftaran,
      nama_lengkap: item.user.nama_lengkap,
      nama_laporan: item.nama_laporan,
      bidang_penelitian: item.bidang_penelitian,
      judul: item.judul,
      // Tambahkan informasi jadwal jika sudah ada
      jadwal_info: item.jadwal_pendaftaran.length > 0 ? item.jadwal_pendaftaran[0] : null,
      sudah_dijadwalkan: item.jadwal_pendaftaran.length > 0
    }));

    res.json(mahasiswa);
  } catch (error) {
    next(error);
  }
}

// Mendapatkan data mahasiswa untuk ditampilkan di halaman EJS
async function getMahasiswaForPage(req, res) {
  try {
    const daftar = await prisma.pendaftaran.findMany({
      where: {
        nama_laporan: { not: null }
      },
      select: {
        id_pendaftaran: true,
        nama_laporan: true,
        bidang_penelitian: true,
        judul: true,
        user: {
          select: {
            nama_lengkap: true
          }
        },
        // Tambahkan relasi ke jadwal_pendaftaran untuk cek status
        jadwal_pendaftaran: {
          select: {
            id_jadwal: true,
            jadwal_semhas: true,
            tanggal_semhas: true,
            dosen_penguji: true,
            status: true
          }
        }
      }
    });

    const mahasiswa = daftar.map(item => ({
      id_pendaftaran: item.id_pendaftaran,
      nama_lengkap: item.user.nama_lengkap,
      nama_laporan: item.nama_laporan,
      bidang_penelitian: item.bidang_penelitian,
      judul: item.judul,
      // Tambahkan informasi jadwal jika sudah ada
      jadwal_info: item.jadwal_pendaftaran.length > 0 ? item.jadwal_pendaftaran[0] : null,
      sudah_dijadwalkan: item.jadwal_pendaftaran.length > 0
    }));

    return mahasiswa;
  } catch (error) {
    throw new Error('Gagal mengambil data mahasiswa');
  }
}

// Mendapatkan daftar semua dosen (untuk dropdown)
async function getDosen(req, res) {
  try {
    // Menggunakan nama tabel yang benar sesuai schema
    const dosenList = await prisma.jadwal_dosendosen.findMany({
      select: {
        id_user: true,
        user: {
          select: {
            nama_lengkap: true,
          }
        }
      },
      distinct: ['id_user'] // Hindari duplikasi dosen yang sama
    });

    const dosen = dosenList.map(item => ({
      id_user: item.id_user,
      nama_dosen: item.user ? item.user.nama_lengkap : 'Nama Dosen Tidak Tersedia',
    }));

    res.json(dosen);
  } catch (error) {
    console.error('Error in getDosen:', error);
    res.status(500).json({
      message: 'Gagal mengambil daftar dosen',
      error: error.message,
    });
  }
}

// Mendapatkan jadwal dosen berdasarkan id dosen
async function getJadwalDosen(req, res) {
  const { dosen } = req.query;

  try {
    console.log('getJadwalDosen called with dosen:', dosen);

    if (!dosen) {
      return res.status(400).json({
        message: "Parameter 'dosen' tidak ditemukan. Pastikan Anda memilih dosen terlebih dahulu."
      });
    }

    const dosenId = dosen.toString();
    console.log('Dosen ID (as string):', dosenId);

    // Menggunakan nama tabel yang benar sesuai schema
    const jadwal = await prisma.jadwal_dosendosen.findMany({
      where: {
        id_user: dosenId,
      },
      select: {
        id_jadwal_dosen: true,
        tanggal_data: true,
        shift1: true,
        shift2: true,
        shift3: true,
        shift4: true,
        user: {
          select: {
            nama_lengkap: true,
          }
        }
      }
    });

    console.log('Raw jadwal data from DB:', jadwal);

    if (!jadwal || jadwal.length === 0) {
      console.log('No jadwal found for dosen ID:', dosenId);
      return res.status(404).json({ 
        message: 'Tidak ada jadwal dosen tersedia untuk dosen ini',
        dosenId: dosenId 
      });
    }

    const result = jadwal.map(item => ({
      id_jadwal_dosen: item.id_jadwal_dosen,
      tanggal_data: item.tanggal_data,
      shift1: item.shift1,
      shift2: item.shift2,
      shift3: item.shift3,
      shift4: item.shift4,
      nama_dosen: item.user ? item.user.nama_lengkap : 'Nama Dosen Tidak Tersedia',
    }));

    console.log('Final result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error in getJadwalDosen:', error);
    res.status(500).json({
      message: 'Gagal mengambil jadwal dosen',
      error: error.message,
    });
  }
}

// Mendapatkan detail shift berdasarkan jadwal_id
async function getShiftDetails(req, res) {
  const { jadwal_id } = req.query;

  try {
    if (!jadwal_id) {
      return res.status(400).json({
        message: "Parameter 'jadwal_id' tidak ditemukan."
      });
    }

    // Menggunakan nama tabel yang benar sesuai schema
    const jadwal = await prisma.jadwal_dosendosen.findUnique({
      where: {
        id_jadwal_dosen: parseInt(jadwal_id)
      },
      select: {
        shift1: true,
        shift2: true,
        shift3: true,
        shift4: true,
      }
    });

    if (!jadwal) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    res.json(jadwal);
  } catch (error) {
    console.error('Error in getShiftDetails:', error);
    res.status(500).json({
      message: 'Gagal mengambil detail shift',
      error: error.message,
    });
  }
}

// Menetapkan jadwal seminar hasil (semhas) untuk mahasiswa
async function setJadwalSemhas(req, res) {
  const { mahasiswaId, jadwalId, shiftId } = req.body;

  try {
    console.log('setJadwalSemhas called with:', { mahasiswaId, jadwalId, shiftId });

    // Validasi input
    if (!mahasiswaId || !jadwalId || !shiftId) {
      return res.status(400).json({
        message: 'Parameter tidak lengkap. Pastikan mahasiswaId, jadwalId, dan shiftId tersedia.'
      });
    }

    // Mendapatkan informasi shift berdasarkan shiftId
    let shiftJam;
    switch (shiftId) {
      case 'shift1':
        shiftJam = '08:00 - 10:00';
        break;
      case 'shift2':
        shiftJam = '10:00 - 12:00';
        break;
      case 'shift3':
        shiftJam = '12:00 - 15:00';
        break;
      case 'shift4':
        shiftJam = '15:00 - 17:00';
        break;
      default:
        return res.status(400).json({
          message: 'Shift ID tidak valid'
        });
    }

    // Mengambil data jadwal dosen dan nama dosen
    const jadwalDosen = await prisma.jadwal_dosendosen.findUnique({
      where: { id_jadwal_dosen: Number(jadwalId) },
      select: { 
        tanggal_data: true,
        user: {
          select: {
            nama_lengkap: true,
            id_user: true
          }
        }
      }
    });

    if (!jadwalDosen) {
      return res.status(404).json({
        message: 'Jadwal dosen tidak ditemukan'
      });
    }

    // Cek apakah record jadwal_pendaftaran sudah ada
    const existingJadwal = await prisma.jadwal_pendaftaran.findFirst({
      where: {
        id_pendaftaran: Number(mahasiswaId)
      }
    });

    let updateJadwal;
    let isUpdate = false;
    let oldJadwalDosenId = null;
    let oldShiftId = null;

    if (existingJadwal) {
      isUpdate = true;
      
      // Simpan jadwal lama untuk update status shift lama jika berbeda
      if (existingJadwal.id_jadwal_dosen !== Number(jadwalId)) {
        oldJadwalDosenId = existingJadwal.id_jadwal_dosen;
        
        // Cari shift lama berdasarkan jam
        const oldShiftJam = existingJadwal.jadwal_semhas;
        switch (oldShiftJam) {
          case '08:00 - 10:00':
            oldShiftId = 'shift1';
            break;
          case '10:00 - 12:00':
            oldShiftId = 'shift2';
            break;
          case '12:00 - 15:00':
            oldShiftId = 'shift3';
            break;
          case '15:00 - 17:00':
            oldShiftId = 'shift4';
            break;
        }
      }
      
      // Update jika sudah ada
      updateJadwal = await prisma.jadwal_pendaftaran.update({
        where: {
          id_jadwal: existingJadwal.id_jadwal
        },
        data: {
          id_jadwal_dosen: Number(jadwalId),
          jadwal_semhas: shiftJam,
          tanggal_semhas: jadwalDosen.tanggal_data,
          dosen_penguji: jadwalDosen.user.nama_lengkap,
          id_user: jadwalDosen.user.id_user,
          status: 'Terjadwal'
        }
      });
    } else {
      // Create jika belum ada
      updateJadwal = await prisma.jadwal_pendaftaran.create({
        data: {
          id_pendaftaran: Number(mahasiswaId),
          id_jadwal_dosen: Number(jadwalId),
          jadwal_semhas: shiftJam,
          tanggal_semhas: jadwalDosen.tanggal_data,
          dosen_penguji: jadwalDosen.user.nama_lengkap,
          id_user: jadwalDosen.user.id_user,
          status: 'Terjadwal'
        }
      });
    }

    // Update status shift di tabel jadwal_dosendosen (set ke "Kosong")
    const updateData = {};
    updateData[shiftId] = "Kosong";

    await prisma.jadwal_dosendosen.update({
      where: { id_jadwal_dosen: Number(jadwalId) },
      data: updateData
    });

    // Jika ini adalah update dan jadwal dosen berbeda, kembalikan status shift lama ke "Tersedia"
    if (isUpdate && oldJadwalDosenId && oldShiftId) {
      const restoreData = {};
      restoreData[oldShiftId] = "Tersedia";
      
      await prisma.jadwal_dosendosen.update({
        where: { id_jadwal_dosen: oldJadwalDosenId },
        data: restoreData
      });
    }

    res.json({
      message: isUpdate ? 'Jadwal seminar hasil berhasil diperbarui' : 'Jadwal seminar hasil berhasil ditentukan',
      data: updateJadwal,
      isUpdate: isUpdate
    });

  } catch (error) {
    console.error('Error in setJadwalSemhas:', error);
    res.status(500).json({
      message: 'Gagal menetapkan jadwal seminar hasil',
      error: error.message
    });
  }
}

// Ekspor fungsi agar bisa diakses di routes
module.exports = {
  getMahasiswaForPage,
  getMahasiswa,
  getDosen,
  getJadwalDosen,
  getShiftDetails,
  setJadwalSemhas
};