// services/evaluasiSistemService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getEvaluations = async () => {
    try {
        const evaluations = await prisma.evaluasi_sistem.findMany({
            select: {
                id: true,
                createdAt: true,
                dokumentasi: true,
                fitur: true,
                kemudahan: true,
                konten: true,
                responsif: true,
                kritik: true,
                saran: true,
                // Pastikan nama kolom di sini cocok dengan nama field di schema.prisma Anda
                // dan sesuai dengan nama kolom di DB Anda
            },
            orderBy: {
                createdAt: 'desc' // Urutkan berdasarkan waktu pembuatan
            }
        });

        console.log("DEBUG SERVICE EVAL: Raw evaluations from DB:", JSON.stringify(evaluations, null, 2));

        const formattedEvaluations = evaluations.map(eval => {
            // Kita akan mengembalikan nilai-nilai ini sesuai urutan header frontend
            return [
                // Urutan sesuai header: ['createdAt', 'dokumentasi', 'fitur', 'id', 'kemudahan', 'konten', 'kritik', 'responsif', 'saran']
                // Perhatikan: 'No' akan ditambahkan di frontend
                eval.createdAt.toISOString().slice(0, 10), // Format tanggal menjadi YYYY-MM-DD
                eval.dokumentasi,
                eval.fitur,
                eval.kemudahan,
                eval.konten,
                eval.responsif,
                eval.kritik || '', // Pastikan ada nilai default jika null
                eval.saran || '' // Pastikan ada nilai default jika null
            ];
        });
        console.log("DEBUG SERVICE EVAL: Formatted evaluations for frontend:", JSON.stringify(formattedEvaluations, null, 2));

        return formattedEvaluations;

    } catch (error) {
        console.error("Error in evaluasiSistemService.getEvaluations:", error);
        throw new Error('Failed to fetch evaluation data.');
    }
};

// services/evaluasiSistemService.js

// ... (kode getEvaluations yang sudah dimodifikasi) ...

const PDFDocument = require('pdfkit'); // <--- TAMBAHKAN INI DI BAGIAN ATAS FILE (bersama PrismaClient)

const generateEvaluationsPdf = async () => {
    try {
        // Ambil semua data evaluasi lagi dari DB
        // Kali ini, ambil semua kolom yang relevan untuk PDF
        const evaluations = await prisma.evaluasi_sistem.findMany({
            select: {
                id: true,
                createdAt: true,
                dokumentasi: true,
                fitur: true,
                kemudahan: true,
                konten: true,
                kritik: true,
                responsif: true,
                saran: true,

            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        // doc.on('end', () => {
        //     let pdfBuffer = Buffer.concat(buffers);
        //     resolve(pdfBuffer);
        // });

        // Header PDF
        doc.fontSize(20).text('Laporan Evaluasi Sistem', { align: 'center' });
        doc.moveDown();

        // Tambahkan data tabel ke PDF
        evaluations.forEach((evalItem, index) => {
            doc.fontSize(12).text(`--- Evaluasi #${index + 1} (ID: ${evalItem.id}) ---`);
            doc.fontSize(10).text(`Tanggal Pengisian: ${evalItem.createdAt.toISOString().slice(0, 10)}`);
            doc.text(`Dokumentasi: ${evalItem.dokumentasi}`);
            doc.text(`Fitur: ${evalItem.fitur}`);
            doc.text(`Kemudahan: ${evalItem.kemudahan}`);
            doc.text(`Konten: ${evalItem.konten}`);
            doc.text(`Responsif: ${evalItem.responsif}`);
            doc.text(`Kritik: ${evalItem.kritik || 'Tidak ada'}`);
            doc.text(`Saran: ${evalItem.saran || 'Tidak ada'}`);
            doc.moveDown();
        });

        doc.end();

        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error('Gagal mengenerate PDF laporan evaluasi.');
    }
};

module.exports = {
    getEvaluations,
    generateEvaluationsPdf, // <--- EKSPOR FUNGSI BARU INI
};