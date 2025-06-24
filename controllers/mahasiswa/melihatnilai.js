const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFormMelihat = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Semua await di dalam async function ini
    const bacajudul = await prisma.pendaftaran.findFirst({
      where: {
        id_user: user.userId
      },
      select: {
        id_pendaftaran: true,
        judul: true,
        nama_dosen: true
      }
    });

    console.log("User Login ID:", user.userId);
    console.log("ID Pendaftaran:", bacajudul?.id_pendaftaran); // pakai optional chaining supaya tidak error

    if (!bacajudul) {
      return res.status(404).send('Data pendaftaran tidak ditemukan');
    }

    const nilai = await prisma.nilai_semhas.findFirst({
      where: {
        id_pendaftaran: bacajudul.id_pendaftaran
      },
      include: {
        rubik: true,
        pendaftaran: true
      }
    });

    if (!nilai || !nilai.rubik) {
      return res.status(404).send('Nilai belum tersedia');
    }

    const kriteriaPenilaian = [
      { label: 'Pemahaman terhadap Materi Tugas Akhir', nilai: nilai.rubik.pemahaman },
      { label: 'Kelengkapan dan Kualitas Dokumentasi Laporan', nilai: nilai.rubik.dokumenasi },
      { label: 'Kemampuan dalam Menyampaikan Presentasi', nilai: nilai.rubik.presentasi },
      { label: 'Ketepatan Waktu dalam Pelaksanaan Presentasi', nilai: nilai.rubik.ketepatan_waktu },
      { label: 'Sikap Profesional saat Presentasi dan Tanya Jawab', nilai: nilai.rubik.sikap },
    ];

    let nip_dosen = '-';
    if (bacajudul.nama_dosen) {
      const dosen = await prisma.user.findFirst({
        where: { nama_lengkap: bacajudul.nama_dosen },
        select: { id_user: true }
      });
      if (dosen) {
        nip_dosen = dosen.id_user;
      }
    }

    return res.render('mahasiswa/melihatdandownloadnilai', {
      nama_lengkap: user.nama_lengkap,
      judul: nilai.pendaftaran.judul || '-',
      user: req.user,
      kriteriaPenilaian,
      nama_dosen: bacajudul.nama_dosen || '-',
      nip_dosen,
      komentar: nilai.komentar || '-',
      status_semhas: nilai.status_semhas || '-'
    });

  } catch (error) {
    console.error('ERROR MELIHAT NILAI:', error);
    return res.status(500).send('Terjadi kesalahan saat melihat nilai');
  }
};