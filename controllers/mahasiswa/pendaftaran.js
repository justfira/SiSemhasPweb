const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Menampilkan halaman form pendaftaran
exports.getFormPendaftaran = async (req, res) => {
  try {
    // Ambil daftar dosen berdasarkan role 'DOSEN' di tabel user
    const dosenList = await prisma.user.findMany({
      where: {
        role: 'DOSEN'  // Filter hanya user dengan role 'DOSEN'
      },
      select: {
        id_user: true,      // Ambil id_user dari user (yang akan menjadi nip_dosen)
        nama_lengkap: true, // Ambil nama lengkap dosen dari user
      }
    });

    console.log("id cookie dari JWT : ", req.user.userId);
    console.log("email cookie dari JWT : ", req.user.email);
    console.log("role cookie dari JWT : ", req.user.role);

    const bidangList = [
      'Business intelligence',
      'Enterprise',
      'System Development',
      'Geographic Information System'
    ];

    // Memformat dosenList untuk digunakan di EJS
    const formattedDosenList = dosenList.map((dosen) => ({
      id_user: dosen.id_user,   // Ambil id_user dosen
      nama_lengkap: dosen.nama_lengkap // Ambil nama dosen
    }));

    res.render('mahasiswa/pendaftaranMhs', { dosenList: formattedDosenList, bidangList });
  } catch (error) {
    console.error('Gagal mengambil data dosen:', error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data dosen.');
  }
};



// Menyimpan data form pendaftaran
// Controller untuk menyimpan pendaftaran dan mengarahkan ke upload
exports.submitFormPendaftaran = async (req, res) => {
  try {
    const { judul, bidangPenelitian, namaDosen } = req.body;

    const id_user = req.user.userId;

    const dosenList = await prisma.user.findMany({
      where: {
        nama_lengkap: namaDosen  // Filter hanya user dengan role 'DOSEN'
      },
      select: {
        id_user: true,      // Ambil id_user dari user (yang akan menjadi nip_dosen)
         // Ambil nama lengkap dosen dari user
      }
    });

    // Memastikan semua field wajib diisi
    if (!judul || !bidangPenelitian || !namaDosen) {
      return res.status(400).send('Semua field wajib diisi.');
    }

    

    // Menyaring data mahasiswa berdasarkan id_user
    const mahasiswa = await prisma.user.findUnique({
      where: { id_user: id_user },
      select: {
        nama_lengkap: true,
        role: true
      }
    });
    // const dosen = await prisma.dosen.findUnique({
    //   where: { namaDosen: namaDosen },
    //   select: {
    //     id_user: true,
    //   }
    // });

    if (!mahasiswa || mahasiswa.role !== 'MAHASISWA') {
      return res.status(400).send('Data mahasiswa tidak ditemukan.');
    }

    // Menyimpan pendaftaran di tabel pendaftaran
    const newPendaftaran = await prisma.pendaftaran.create({
      data: {
        id_user: id_user,
        judul: judul.trim(),
        bidang_penelitian: bidangPenelitian,
        nama_dosen: namaDosen,
      }
    });

    // Ambil id_pendaftaran yang baru dibuat
    const id_pendaftaran = newPendaftaran.id_pendaftaran;

    // Redirect ke halaman upload dengan id_pendaftaran yang baru
    res.redirect(`/mahasiswa/upload/${id_pendaftaran}`); // Arahkan ke route /upload/{id_pendaftaran}
  } catch (error) {
    console.error('Gagal menyimpan pendaftaran:', error);
    res.status(500).send('Terjadi kesalahan saat menyimpan data.');
  }
};