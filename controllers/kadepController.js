const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listBidangKeahlian = async (req, res) => {
  try {
    const dosens = await prisma.dosen.findMany({
      orderBy: { nama_dosen: 'asc' }
    });

    const bidangOptions = ['Tata Kelola', 'Rekayasa Digital dan Business Intelligence', 'Enterprise System', 'System Development'];
    const initialNip = dosens.length > 0 ? dosens[0].nip_dosen : '';

    res.render('kadep/bidangkeahlian', {
      dosens,
      bidangOptions,
      initialNip,
      totalCount: dosens.length,
      perPage: 6,
      currentPage: parseInt(req.query.page) || 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// POST /dosen/:nip/bidang-keahlian  → set / tambah
exports.tambahBidangKeahlian = async (req, res) => {
  const nip = parseInt(req.params.nip, 10);
  const { bidang_keahlian } = req.body;
  try {
    await prisma.dosen.update({
      where: { nip_dosen: nip },
      data: { bidang_keahlian }
    });
    res.redirect('/bidang-keahlian');
  } catch (e) {
    console.error(e);
    res.status(500).send('Gagal menambah bidang keahlian');
  }
};

// PUT dan DELETE: karena form HTML tidak support PUT/DELETE,
// kamu bisa menggunakan method-override atau query param _method
exports.ubahBidangKeahlian = async (req, res) => {
  const nip = parseInt(req.params.nip, 10);
  const { bidang_keahlian } = req.body;
  try {
    await prisma.dosen.update({
      where: { nip_dosen: nip },
      data: { bidang_keahlian }
    });
    res.redirect('/bidang-keahlian');
  } catch (e) {
    console.error(e);
    res.status(500).send('Gagal mengubah bidang keahlian');
  }
};

exports.hapusBidangKeahlian = async (req, res) => {
  const nip = parseInt(req.params.nip, 10);
  try {
    // karena non-nullable, kita kosongkan string
    await prisma.dosen.update({
      where: { nip_dosen: nip },
      data: { bidang_keahlian: '' }
    });
    res.redirect('/bidang-keahlian');
  } catch (e) {
    console.error(e);
    res.status(500).send('Gagal menghapus bidang keahlian');
  }
};
