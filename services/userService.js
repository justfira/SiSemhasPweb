// // services/userService.js
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const bcrypt = require('bcryptjs'); // Pastikan sudah diinstal

// const getUsersWithDetails = async () => {
//     try {
//         const users = await prisma.user.findMany({
//             orderBy: { role: 'asc' }, // Order by Enum value is usually alphabetical string representation
//             select: {
//                 email: true,
//                 role: true,
//                 // NAMA RELASI DI SELECT BERUBAH DARI 'adminProfile' MENJADI 'admin' DST.
//                 admin: { select: { nama_admin: true } },       // <--- BERUBAH
//                 dosen: { select: { nama_dosen: true } },       // <--- BERUBAH
//                 kadep: { select: { nama_kadep: true } },       // <--- BERUBAH
//                 mahasiswa: { select: { nama_lengkap: true } }, // <--- BERUBAH
//             }
//         });

//         console.log("DEBUG: Raw users fetched by Prisma:", JSON.stringify(users, null, 2));

//         const usersWithDetails = users.map(user => {
//             let name = 'N/A';
//             // user.role sekarang adalah ENUM (misal: 'ADMIN', 'DOSEN')
//             // Pastikan Anda membandingkannya dengan string yang benar
//             switch (user.role) { // <--- TIDAK PERLU .toLowerCase() JIKA ANDA MENGANDALKAN ENUM UPPERCASE
//                 case 'ADMIN': name = user.admin?.nama_admin || 'N/A'; break;       // <--- BERUBAH
//                 case 'DOSEN': name = user.dosen?.nama_dosen || 'N/A'; break;       // <--- BERUBAH
//                 case 'KADEP': name = user.kadep?.nama_kadep || 'N/A'; break;       // <--- BERUBAH
//                 case 'MAHASISWA': name = user.mahasiswa?.nama_lengkap || 'N/A'; break; // <--- BERUBAH
//                 default: name = 'N/A';
//             }
//             return { email: user.email, role: user.role, name: name };
//         });
//         return usersWithDetails;
//     } catch (error) {
//         console.error("Error in userService.getUsersWithDetails:", error);
//         throw new Error('Failed to fetch user data');
//     }
// };

// // Fungsi baru untuk mengupdate role user (updateUsersRoles)
// const updateUsersRoles = async (updates) => {
//     return await prisma.$transaction(async (tx) => {
//         const results = [];
//         for (const update of updates) {
//             const { email, newRole } = update; // newRole dari frontend biasanya lowercase

//             const user = await tx.user.findUnique({
//                 where: { email: email },
//                 select: { email: true, role: true }
//             });

//             if (!user) {
//                 results.push({ email: email, success: false, message: 'User not found.' });
//                 continue;
//             }

//             const oldRole = user.role; // user.role sekarang adalah ENUM (misal: 'ADMIN')

//             // Pastikan newRole diubah ke format ENUM sebelum dibandingkan/diupdate
//             const newRoleEnum = newRole.toUpperCase(); // Konversi ke UPPERCASE ENUM

//             if (oldRole !== newRoleEnum) {
//                 await tx.user.update({
//                     where: { email: email },
//                     data: { role: newRoleEnum } // <--- UPDATE ROLE DENGAN ENUM
//                 });
//                 results.push({ email: email, success: true, message: `Role updated from ${oldRole} to ${newRoleEnum}.` });
//             } else {
//                 results.push({ email: email, success: true, message: 'Role already the same, no update needed.' });
//             }
//         }
//         return results;
//     });
// };


// // Fungsi baru untuk membuat user dari permintaan akses
// const createUserFromAccessRequest = async ({ requestEmail, nim, nama_lengkap }) => {
//     const tempPassword = Math.random().toString(36).substring(2, 10);
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);

//     return await prisma.$transaction(async (tx) => {
//         const newUser = await tx.user.create({
//         data: {
//             email: requestEmail,
//             password: hashedPassword,
//             role: 'MAHASISWA' // <--- UBAH ROLE MENJADI ENUM UPPERCASE
//         }
//     });

//         const updatedMahasiswa = await tx.mahasiswa.update({
//             where: { nim: nim },
//             data: {
//                 status: 'punya akses',
//                 email: newUser.email,
//                 request_email: null
//             }
//         });

//         return {
//             email: newUser.email,
//             role: newUser.role,
//             name: nama_lengkap,
//             tempPassword: tempPassword
//         };
//     });
// };

// // --- HANYA ADA SATU module.exports DI SINI ---
// module.exports = {
//     getUsersWithDetails,
//     updateUsersRoles, // Pastikan ini juga diekspor
//     createUserFromAccessRequest
// };

// services/userService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Pastikan sudah diinstal

const getUsersWithDetails = async () => {
  try {
    // whereClause dan filterRole dihapus dari fungsi ini
    // const whereClause = {};
    // if (filterRole && filterRole !== 'semua') {
    //   whereClause.role = filterRole;
    // }

    const users = await prisma.user.findMany({
      // orderBy: { role: 'asc' }, // Order by Enum value is usually alphabetical string representation
      orderBy: { email: 'asc' }, // Urutkan berdasarkan email, karena role sekarang Enum
      select: {
        email: true,
        role: true,
        nama_lengkap: true, // <--- AMBIL NAMA_LENGKAP LANGSUNG DARI TABEL USER
        // HAPUS SEMUA SELECT RELASI KE TABEL LAIN (admin, dosen, kadep, mahasiswa)
        // admin: { select: { nama_admin: true } },
        // dosen: { select: { nama_dosen: true } },
        // kadep: { select: { nama_kadep: true } },
        // mahasiswa: { select: { nama_lengkap: true } },
      }
    });

    console.log("DEBUG: Raw users fetched by Prisma:", JSON.stringify(users, null, 2));

    const usersWithDetails = users.map(user => {
      // Nama sekarang diambil langsung dari user.nama_lengkap
      let name = user.nama_lengkap || 'N/A'; // <--- Sederhanakan penentuan nama
      
    //   HAPUS LOGIKA SWITCH CASE INI
    //   switch (user.role) {
    //     case 'ADMIN': name = user.admin?.nama_admin || 'N/A'; break;
    //     case 'DOSEN': name = user.dosen?.nama_dosen || 'N/A'; break;
    //     case 'KADEP': name = user.kadep?.nama_kadep || 'N/A'; break;
    //     case 'MAHASISWA': name = user.mahasiswa?.nama_lengkap || 'N/A'; break;
    //     default: name = 'N/A';
    //   }
      return { email: user.email, role: user.role, name: name };
    });
    return usersWithDetails;
  } catch (error) {
    console.error("Error in userService.getUsersWithDetails:", error);
    throw new Error('Failed to fetch user data');
  }
};

const deleteUserByEmail = async (email) => {
    try {
        // Hapus user berdasarkan email
        const deletedUser = await prisma.user.delete({
            where: {
                email: email
            }
        });
        return deletedUser;
    } catch (error) {
        console.error("Error in userService.deleteUserByEmail:", error);
        // Tangani error jika user tidak ditemukan atau ada masalah lain
        if (error.code === 'P2025') { // Prisma error code for record not found
            throw new Error(`User with email ${email} not found.`);
        }
        throw new Error('Failed to delete user.');
    }
};
// ...
const updateUsersRoles = async (updates) => {
    return await prisma.$transaction(async (tx) => {
        const results = [];
        for (const update of updates) {
            const { email, newRole } = update; // newRole dari frontend biasanya lowercase

            const user = await tx.user.findUnique({
                where: { email: email },
                select: { email: true, role: true }
            });

            if (!user) {
                results.push({ email: email, success: false, message: 'User not found.' });
                continue;
            }

            const oldRole = user.role; // user.role sekarang adalah ENUM (misal: 'ADMIN')

            // Pastikan newRole diubah ke format ENUM sebelum dibandingkan/diupdate
            const newRoleEnum = newRole.toUpperCase(); // Konversi ke UPPERCASE ENUM

            if (oldRole !== newRoleEnum) {
                await tx.user.update({
                    where: { email: email },
                    data: { role: newRoleEnum } // <--- UPDATE ROLE DENGAN ENUM
                });
                results.push({ email: email, success: true, message: `Role updated from ${oldRole} to ${newRoleEnum}.` });
            } else {
                results.push({ email: email, success: true, message: 'Role already the same, no update needed.' });
            }
        }
        return results;
    });
};

// --- HANYA ADA SATU module.exports DI SINI ---
module.exports = {
  getUsersWithDetails,
  deleteUserByEmail,
  updateUsersRoles, // Pastikan ini juga diekspor
  
};