const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPendaftaran = async (req, res) => {
  try {
    // Ambil semua data pendaftaran dimana nama_laporan tidak null
    const pendaftaran = await prisma.pendaftaran.findMany({
      where: {
        nama_laporan: {
          not: null, // Pastikan nama_laporan tidak null
        }
      },
      select: {
        id_pendaftaran: true,
        judul: true,
        bidang_penelitian: true,
        status: true,
      },
      orderBy: {
        id_pendaftaran: 'desc', // Urutkan berdasarkan id_pendaftaran jika perlu
      }
    });

    // Render data pendaftaran ke halaman admin
    res.render('admin/statusSemhas', {
      pendaftaran,
    });

  } catch (error) {
    console.error('Error fetching pendaftaran data:', error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: parseInt(id) },
    });

    if (!pendaftaran) {
      return res.status(404).send('Pendaftaran seminar tidak ditemukan');
    }

    // Update status seminar (Lulus/Revisi)
    const updatedStatus = pendaftaran.status === 'Lulus' ? 'Revisi' : 'Lulus';

    await prisma.pendaftaran.update({
      where: { id_pendaftaran: parseInt(id) },
      data: {
        status: updatedStatus, // Update status seminar
      },
    });

    // Redirect ke halaman daftar pendaftaran setelah status diubah
    res.redirect('/status');
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send('Terjadi kesalahan dalam memperbarui status');
  }
};

