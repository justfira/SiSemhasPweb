// services/pendaftaranService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

/**
 * Mengambil dan memformat data pendaftaran untuk tampilan di frontend.
 * Akan mengambil nama lengkap dan NIM dari tabel 'user' yang terkait.
 * @returns {Array<Array<string>>} Data pendaftaran yang diformat.
 */
const getRegistrations = async () => {
    try {
        const registrations = await prisma.pendaftaran.findMany({
            select: {
                id_pendaftaran: true,
                judul: true,
                bidang_penelitian: true,
                nama_dosen: true,
                user: { // Mengambil data dari relasi user
                    select: {
                        id_user: true, // Ini adalah NIM
                        nama_lengkap: true,
                    },
                },
            },
            orderBy: {
                id_pendaftaran: 'desc'
            }
        });

        console.log("DEBUG SERVICE REGISTRATION: Raw registrations from DB:", JSON.stringify(registrations, null, 2));

        const formattedRegistrations = registrations.map(reg => {
            return [
                reg.user?.nama_lengkap || 'N/A', // Nama Lengkap dari user
                reg.user?.id_user || 'N/A',     // ID User (NIM) dari user
                reg.judul || 'Tidak Ada Judul',
                reg.nama_dosen || 'Tidak Ada Dosen',
                reg.bidang_penelitian || 'Tidak Ada Bidang',
            ];
        });

        console.log("DEBUG SERVICE REGISTRATION: Formatted registrations for frontend:", JSON.stringify(formattedRegistrations, null, 2));

        return formattedRegistrations;

    } catch (error) {
        console.error("Error in pendaftaranService.getRegistrations:", error);
        throw new Error('Failed to fetch registration data.');
    }
};

/**
 * Mengenerate laporan PDF dari data pendaftaran.
 * @returns {Promise<Buffer>} Buffer PDF.
 */
const generateRegistrationsPdf = async () => {
    try {
        const registrations = await prisma.pendaftaran.findMany({
            select: {
                id_pendaftaran: true,
                judul: true,
                bidang_penelitian: true,
                nama_dosen: true,
                user: {
                    select: {
                        id_user: true,
                        nama_lengkap: true,
                    },
                },
            },
            orderBy: {
                id_pendaftaran: 'desc'
            }
        });

        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));

        // Header PDF
        doc.fontSize(20).text('Laporan Pendaftaran', { align: 'center' });
        doc.moveDown();

        // Tambahkan data tabel ke PDF
        registrations.forEach((regItem, index) => {
            doc.fontSize(12).text(`--- Pendaftaran #${index + 1} (ID: ${regItem.id_pendaftaran}) ---`);
            doc.fontSize(10).text(`Nama Lengkap: ${regItem.user?.nama_lengkap || 'Tidak Ada'}`);
            doc.text(`NIM/ID User: ${regItem.user?.id_user || 'Tidak Ada'}`);
            doc.text(`Judul: ${regItem.judul || 'Tidak Ada'}`);
            doc.text(`Dosen Pembimbing: ${regItem.nama_dosen || 'Tidak Ada'}`);
            doc.text(`Bidang Penelitian: ${regItem.bidang_penelitian || 'Tidak Ada'}`);
            doc.moveDown();
        });

        doc.end();

        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });

    } catch (error) {
        console.error("Error generating registration PDF:", error);
        throw new Error('Gagal mengenerate PDF laporan pendaftaran.');
    }
};

module.exports = {
    getRegistrations,
    generateRegistrationsPdf,
};