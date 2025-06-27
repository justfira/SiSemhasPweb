const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getListMahasiswa = async (req, res) => {
  try {
    const dosen = req.user;

    if (!dosen || !dosen.userId || dosen.role !== 'DOSEN') {
        return res.status(403).send('Akses Ditolak: Pengguna atau peran tidak valid.');
    }

    const namaDosen = dosen.nama_lengkap;

    const pendaftaranList = await prisma.pendaftaran.findMany({
      where: {
        jadwal_pendaftaran: {
          some: {
            dosen_penguji: namaDosen
          }
        }
      },
      include: {
        user: true,
        jadwal_pendaftaran: true, // Kita butuh ini untuk mencari jadwal spesifik
        periode_semhas: true,
      }
    });

    // --- PERUBAHAN UTAMA DI BLOK INI ---
    const formattedData = pendaftaranList.map(p => {
      // 1. Cari jadwal yang spesifik untuk dosen yang sedang login
      const jadwalSpesifik = p.jadwal_pendaftaran.find(
        j => j.dosen_penguji === namaDosen
      );

      // 2. Gunakan jadwalSpesifik itu. Jika tidak ketemu (seharusnya tidak mungkin), gunakan objek kosong.
      const jadwal = jadwalSpesifik || {};
      const namaMahasiswa = p.user ? p.user.nama_lengkap : 'Nama Tidak Ditemukan';

      // 3. Rakit kembali data untuk ditampilkan
      return {
        nim: p.id_user,
        nama: namaMahasiswa,
        // Ambil judul dari pendaftaran (p)
        judul_seminar: p.judul,
        // Ambil tanggal dari periode seminar (p.periode_semhas)
        tanggal_seminar: p.periode_semhas?.tanggal_buka,
        // Ambil waktu dari JADWAL SPESIFIK yang sudah kita temukan
        waktu_mulai: jadwal.jam_mulai ? new Date(jadwal.jam_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) : null,
        waktu_selesai: jadwal.jam_selesai ? new Date(jadwal.jam_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) : null,
      };
    });
    
    console.log("LOG: Data yang diformat untuk EJS (mahasiswaList):", formattedData);

    res.render('dosen/mahasiswaseminar', { 
      mahasiswaList: formattedData,
      title: 'List Mahasiswa Seminar'
    });

  } catch (error) {
    console.error('Kesalahan Database di getListMahasiswa:', error);
    res.status(500).render('dosen/mahasiswaseminar', {
      mahasiswaList: [],
      errorMessage: `Gagal memuat data dari database: ${error.message}`,
      title: 'List Mahasiswa Seminar'
    });
  }
}

module.exports = {
  getListMahasiswa
}