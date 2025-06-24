// services/panduanService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs').promises;
const path = require('path');
// const os = require('os'); // Tidak perlu lagi os.tmpdir() jika Anda menentukan path sendiri

// Define your base storage directory for panduan files.
// It's relative to the current file (panduanService.js).
// '__dirname' refers to the directory of the current module (services/).
// '..' goes up one level (to TBPWEB4/).
// 'temp_files' enters the target folder.
const BASE_FILE_STORAGE_DIR = path.join(__dirname, '..', 'temp_files');

// Fungsi untuk mengunggah PDF baru
const uploadPanduan = async (nama_file, file_buffer) => {
    try {
        const fullFilePath = path.join(BASE_FILE_STORAGE_DIR, nama_file);

        // Pastikan direktori penyimpanan ada
        await fs.mkdir(BASE_FILE_STORAGE_DIR, { recursive: true });

        // Simpan file_buffer ke disk
        await fs.writeFile(fullFilePath, file_buffer);
        console.log(`File saved to: ${fullFilePath}`);

        // Simpan metadata ke database (kolom 'file' akan diisi dengan Buffer kosong)
        const newPanduan = await prisma.panduan.create({
            data: {
                nama_file: nama_file,
                tanggal_unggah: new Date(),
                file: Buffer.from(''), // Ganti dengan 'file: null' jika kolom 'file' nullable
            }
        });

        console.log(`DEBUG UPLOAD: Menerima file: ${nama_file}, ukuran: ${file_buffer.length} bytes`);
        return newPanduan;
    } catch (error) {
        console.error("Error uploading panduan:", error);
        throw new Error('Gagal mengunggah panduan.');
    }
};

// ... (Fungsi getAllPanduan, getLatestPanduan, getPanduanFile tetap sama)

// Fungsi untuk mendapatkan semua panduan (untuk tabel riwayat)
const getAllPanduan = async () => {
    try {
        const panduanList = await prisma.panduan.findMany({
            select: {
                id_panduan: true,
                nama_file: true,
                tanggal_unggah: true,
            },
            orderBy: {
                tanggal_unggah: 'desc'
            }
        });
        return panduanList.map(p => ({
            id: p.id_panduan,
            namaFile: p.nama_file,
            tanggalUnggah: p.tanggal_unggah.toISOString().slice(0, 10),
        }));
    } catch (error) {
        console.error("Error fetching all panduan:", error);
        throw new Error('Gagal mengambil daftar panduan.');
    }
};

// Fungsi untuk mendapatkan panduan terbaru (untuk tampilan "Buku Panduan")
const getLatestPanduan = async () => {
    try {
        const latestPanduan = await prisma.panduan.findFirst({
            orderBy: {
                id_panduan: 'desc'
            },
            select: {
                id_panduan: true,
                nama_file: true,
            }
        });
        return latestPanduan;
    } catch (error) {
        console.error("Error fetching latest panduan:", error);
        return null;
    }
};

// Fungsi untuk mendapatkan data file PDF berdasarkan ID (untuk download/tampilkan)
const getPanduanFile = async (id_panduan) => {
    try {
        const panduan = await prisma.panduan.findUnique({
            where: { id_panduan: id_panduan },
            select: {
                nama_file: true,
            }
        });

        if (!panduan || !panduan.nama_file) {
            console.warn(`Panduan with ID ${id_panduan} or its file name not found in DB.`);
            return null;
        }

        const fullFilePath = path.join(BASE_FILE_STORAGE_DIR, panduan.nama_file);

        const fileBuffer = await fs.readFile(fullFilePath);

        console.log(`DEBUG FILE: File found. Name: ${panduan.nama_file}, data size: ${fileBuffer.length} bytes`);
        return {
            nama_file: panduan.nama_file,
            file_buffer: fileBuffer
        };
    } catch (error) {
        console.error(`Error fetching panduan file data for ID ${id_panduan}:`, error);
        throw new Error('Gagal mengambil data file panduan.');
    }
};

module.exports = {
    uploadPanduan,
    getAllPanduan,
    getLatestPanduan,
    getPanduanFile,
};