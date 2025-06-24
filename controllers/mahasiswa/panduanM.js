// === Bagian atas: import module & service ===
const panduanService = require('../../services/panduanService');

// === Fungsi: ambil panduan terbaru (untuk ditampilkan di mahasiswa) ===
const getLatestPanduanApi = async (req, res) => {
    console.log('DEBUG: Masuk ke getLatestPanduanApi');

    try {
        const latest = await panduanService.getLatestPanduan();
        if (!latest) {
            return res.status(404).json({ message: 'Tidak ada panduan tersedia.' });
        }
        res.status(200).json(latest);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil panduan terbaru.', error: error.message });
    }
};

// === Fungsi: ambil file panduan berdasarkan ID ===
const getPanduanFileApi = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID panduan tidak valid.' });
    }

    try {
        const fileData = await panduanService.getPanduanFile(id);
        if (!fileData || !fileData.file_buffer) {
            return res.status(404).json({ message: 'File panduan tidak ditemukan.' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileData.nama_file}"`);
        res.setHeader('Content-Length', fileData.file_buffer.length);
        res.send(fileData.file_buffer);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil file panduan.', error: error.message });
    }
};


// === Ekspor semua controller mahasiswa ===
module.exports = {
    getLatestPanduanApi,
    getPanduanFileApi,
};