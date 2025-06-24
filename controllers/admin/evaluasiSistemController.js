// controllers/evaluasiSistemController.js
const evaluasiSistemService = require('../../services/evaluasiSistemService'); 

const getEvaluationsApi = async (req, res) => { // <--- PASTIKAN NAMA FUNGSI INI BENAR
    try {
        const evaluations = await evaluasiSistemService.getEvaluations();
        res.status(200).json(evaluations);
    } catch (error) {
        console.error("Error in evaluasiSistemController.getEvaluationsApi:", error.message);
        res.status(500).json({ message: 'Error fetching evaluations.', details: error.message });
    }
};

const generateEvaluationsPdfApi = async (req, res) => {
    try {
        const pdfBuffer = await evaluasiSistemService.generateEvaluationsPdf();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="laporan_evaluasi_sistem.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error in generateEvaluationsPdfApi:", error.message);
        res.status(500).json({ message: 'Gagal mengenerate PDF laporan evaluasi.', details: error.message });
    }
};

module.exports = {
    getEvaluationsApi,
    generateEvaluationsPdfApi, // <--- EKSPOR FUNGSI BARU INI
};

