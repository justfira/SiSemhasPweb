// controllers/pendaftaranController.js
const pendaftaranService = require('../../services/pendaftaranService');

const getPendaftaranData = async (req, res) => {
    try {
        const data = await pendaftaranService.getRegistrations();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const downloadPendaftaranPdf = async (req, res) => {
    try {
        const pdfBuffer = await pendaftaranService.generateRegistrationsPdf();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="laporan_pendaftaran.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPendaftaranData,
    downloadPendaftaranPdf,
};
