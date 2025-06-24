// controllers/mahasiswa/detailRiwayat.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit'); // Ensure PDFDocument is imported

async function generateRiwayatSeminarPdf(req, res) {
  try {
    const { id } = req.params;  // Get ID from URL

    // Fetch data based on ID
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: parseInt(id) },
      select: {
        judul: true,
        nama_dosen: true,
        user: {
          select: {
            id_user: true,
            nama_lengkap: true,
          },
        },
      },
    });

    if (!pendaftaran) {
      return res.status(404).send('Seminar tidak ditemukan');
    }

    // Ambil status dari tabel nilai_semhas
    const nilaiSemhas = await prisma.nilai_semhas.findFirst({
      where: { id_pendaftaran: parseInt(id) },
      select: {
        status_semhas: true,
        komentar: true,
      },
    });

    // Tentukan status yang akan ditampilkan
    let status = 'Belum dinilai';
    let komentar = 'Belum ada komentar';
    if (nilaiSemhas) {
      status = nilaiSemhas.status_semhas || 'Belum dinilai';
      komentar = nilaiSemhas.komentar || 'Belum ada komentar';
    }

    // Set response headers first
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan_seminar_hasil.pdf"');

    const doc = new PDFDocument();
    
    // Pipe directly to response instead of using buffers
    doc.pipe(res);

    // Adding content to the PDF
    // Menambahkan header dan lebih banyak pemformatan pada PDF
    doc.fontSize(20).text('Laporan Seminar Hasil', { align: 'center' });
    doc.moveDown(); // Bergerak ke baris berikutnya

    // Menambahkan garis pemisah untuk memperjelas bagian
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Menambahkan garis horizontal

    doc.moveDown(1); // Memberikan sedikit jarak setelah garis

    // Judul Seminar
    doc.fontSize(12).text(`Judul Seminar: ${pendaftaran.judul || 'Tidak ada judul'}`, { lineGap: 5 });

    // Dosen Pembimbing
    doc.text(`Dosen Pembimbing: ${pendaftaran.nama_dosen || 'Tidak ada dosen pembimbing'}`, { lineGap: 5 });

    // Status Seminar (dari nilai_semhas)
    doc.text(`Status: ${status}`, { lineGap: 5 });

    // Nama Lengkap Mahasiswa
    doc.text(`Nama Lengkap: ${pendaftaran.user?.nama_lengkap || 'Nama tidak ditemukan'}`, { lineGap: 5 });

    // NIM Mahasiswa
    doc.text(`NIM: ${pendaftaran.user?.id_user || 'NIM tidak ditemukan'}`, { lineGap: 5 });

    doc.moveDown(1);

    // Komentar dari dosen
    doc.text(`Komentar Dosen: ${komentar}`, { lineGap: 5 });

    doc.moveDown(2); // Memberikan jarak setelah bagian informasi seminar

    // Menambahkan garis pemisah
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Menambahkan garis horizontal

    // Menambahkan footer atau informasi lainnya (misalnya tanggal)
    doc.moveDown(1);
    doc.fontSize(10).text(`Tanggal: ${new Date().toLocaleDateString()}`, { align: 'right' });  // Tanggal sekarang di bagian bawah

    // End the document
    doc.end();

  } catch (error) {
    console.error("Error generating seminar PDF:", error);  // Log the error
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).send('Gagal mengenerate PDF');
    }
  }
}

module.exports = { generateRiwayatSeminarPdf };