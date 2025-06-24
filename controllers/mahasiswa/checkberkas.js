exports.getFileBerkas = async (req, res) => {
  const { tipe } = req.params;
  if (!req.user || !req.user.id_user) {
  return res.status(401).send('Unauthorized');
}
const user = req.user;

  const pendaftaran = await prisma.pendaftaran.findFirst({
    where: { id_user: user.id_user },
    select: {
      nama_krs: true,
      nama_ppt: true,
      nama_laporan: true,
      nama_pengesahan: true
    }
  });

  if (!pendaftaran) return res.status(404).send('Data tidak ditemukan');

  let fileName;
  switch (tipe) {
    case 'krs': fileName = pendaftaran.nama_krs; break;
    case 'ppt': fileName = pendaftaran.nama_ppt; break;
    case 'laporan': fileName = pendaftaran.nama_laporan; break;
    case 'lampiran': fileName = pendaftaran.nama_pengesahan; break;
    default: return res.status(400).send('Tipe file tidak valid');
  }

  const filePath = path.join(__dirname, '../../public/uploads/berkas', fileName);
  if (!fs.existsSync(filePath)) return res.status(404).send('File tidak ditemukan');

  res.sendFile(filePath);
};

// update berkas
exports.updateBerkas = async (req, res) => {
  const { tipe } = req.params;
  const user = req.user || { id_user: 1 };
  const file = req.file;

  if (!file) return res.status(400).send("Tidak ada file yang diupload");

  let dataUpdate = {};
  switch (tipe) {
    case 'krs': dataUpdate.nama_krs = file.filename; break;
    case 'ppt': dataUpdate.nama_ppt = file.filename; break;
    case 'laporan': dataUpdate.nama_laporan = file.filename; break;
    case 'lampiran': dataUpdate.nama_pengesahan = file.filename; break;
    default: return res.status(400).send("Tipe file tidak valid");
  }

  await prisma.pendaftaran.updateMany({
    where: { id_user: user.id_user },
    data: dataUpdate
  });

  res.send("Berkas berhasil diunggah");
};
