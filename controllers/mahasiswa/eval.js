// controllers/mahasiswa/eval.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.postFormEvaluasi = async (req, res) => {
  try {
    // Ambil data dari form yang dikirim via frontend
    const {
      fitur,
      konten,
      responsif,
      kemudahan,
      dokumentasi,
      kritik,
      saran
    } = req.body;

    // Simpan ke database melalui Prisma ORM
    const evaluasi = await prisma.evaluasi_sistem.create({
      data: {
        fitur: parseInt(fitur),
        konten: parseInt(konten),
        responsif: parseInt(responsif),
        kemudahan: parseInt(kemudahan),
        dokumentasi: parseInt(dokumentasi),
        kritik: kritik?.trim() || null,
        saran: saran?.trim() || null,
        // Kolom `id` dan `createdAt` otomatis diisi sesuai definisi schema.prisma
      }
    });

    // Kirim respons sukses ke frontend
    res.status(201).json({
      message: 'Evaluasi berhasil disimpan secara anonim',
      data: evaluasi // untuk debugging (opsional bisa dihapus)
    });

  } catch (error) {
    console.error('[EVALUASI_ERROR]', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menyimpan evaluasi'
    });
  }
};