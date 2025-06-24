// services/accessRequestService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const userService = require('./userService'); // Import userService untuk membuat user

const getPendingAccessRequests = async () => {
    try {
        const pendingRequests = await prisma.mahasiswa.findMany({
            where: {
                status: 'menunggu'
            },
            select: { // Pilih juga request_email
                nim: true,
                nama_lengkap: true,
                email: true,         // email (FK, akan NULL)
                request_email: true, // <--- AMBIL KOLOM BARU INI
                status: true
            }
        });
        return pendingRequests;
    } catch (error) {
        console.error("Error in accessRequestService.getPendingAccessRequests:", error);
        throw new Error('Failed to fetch pending access requests.');
    }
};

const acceptAccessRequest = async (nim) => {
    return await prisma.$transaction(async (tx) => {
        const mahasiswa = await tx.mahasiswa.findUnique({
            where: { nim: nim }
        });

        if (!mahasiswa || mahasiswa.status.toLowerCase() !== 'menunggu') {
            throw new Error('Access request not found or not in "menunggu" status.');
        }
        // Pastikan request_email ada untuk membuat user
        if (!mahasiswa.request_email) { // <--- Cek kolom request_email
            throw new Error('Mahasiswa request email is missing for accepted request. Cannot create user account.');
        }

        // Panggil fungsi dari userService, LULUSKAN request_email MAHASISWA
        const userCreated = await userService.createUserFromAccessRequest({
            requestEmail: mahasiswa.request_email, // <--- LULUSKAN request_email
            nim: mahasiswa.nim,
            nama_lengkap: mahasiswa.nama_lengkap
        });

        return { success: true, message: `Access request accepted and user created. Temporary Password: ${userCreated.tempPassword}`, user: userCreated };
    });
};

const rejectAccessRequest = async (nim) => {
    try {
        const updatedMahasiswa = await prisma.mahasiswa.update({
            where: { nim: nim },
            data: {
                status: 'belum punya akses',
                email: null,        // <--- Pastikan email (FK) di-NULL-kan
                request_email: null // <--- Kosongkan juga request_email jika ditolak
            }
        });
        return { success: true, message: 'Access request rejected.', mahasiswa: updatedMahasiswa };
    } catch (error) {
        console.error("Error in accessRequestService.rejectAccessRequest:", error);
        throw new Error('Failed to reject access request.');
    }
};

module.exports = {
    getPendingAccessRequests,
    acceptAccessRequest,
    rejectAccessRequest
};