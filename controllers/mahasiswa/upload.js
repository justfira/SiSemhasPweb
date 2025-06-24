const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Folder upload
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

exports.getUploadForm = async (req, res) => {
  const { id_pendaftaran } = req.params;
  const pendaftaran = await prisma.pendaftaran.findUnique({
    where: { id_pendaftaran: parseInt(id_pendaftaran) }
  });

  if (!pendaftaran) return res.status(404).send("❌ Pendaftaran tidak ditemukan");

  res.render('mahasiswa/upload', { id_pendaftaran, pendaftaran });
};

exports.handleUpload = async (req, res) => {
  const { id_pendaftaran } = req.params;
  const updateData = {};

  const saveFile = (field, dbColumn) => {
    const file = req.files[field]?.[0];
    if (file) {
      const fileName = `${Date.now()}_${file.originalname}`;
      fs.writeFileSync(path.join(uploadPath, fileName), file.buffer);
      updateData[dbColumn] = fileName;
    }
  };

  saveFile('krs', 'nama_krs');
  saveFile('ppt', 'nama_ppt');
  saveFile('lampiran', 'nama_pengesahan');
  saveFile('laporan', 'nama_laporan');

  await prisma.pendaftaran.update({
    where: { id_pendaftaran: parseInt(id_pendaftaran) },
    data: updateData
  });

  res.redirect('/dashboard');
};
