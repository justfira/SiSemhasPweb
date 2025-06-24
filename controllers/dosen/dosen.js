const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Menampilkan halaman dashboard untuk dosen, berisi biodata,
 * bidang keahlian, dan jadwal ketersediaan untuk hari ini.
 */
exports.getDashboardD = async (req, res) => {
    try {
        // 1. Validasi Pengguna dari Token JWT
        const { user } = req;
        if (!user || !user.userId || user.role !== 'DOSEN') {
            return res.status(403).send('Akses ditolak: Pengguna tidak valid atau bukan dosen.');
        }
        const dosenId = user.userId;

        // 2. Ambil Profil Dosen dan Bidang Keahlian Terbaru dari Database
        const dosenProfile = await prisma.user.findUnique({
            where: { id_user: dosenId },
            select: {
                id_user: true,
                nama_lengkap: true,
                email: true,
                // Ambil jadwal paling baru yang pernah di-upload untuk mendapatkan bidang keahlian terakhir
                jadwal_dosendosen: {
                    select: { 
                        bidang_keahlian: true,
                        tanggal_data: true 
                    },
                    orderBy: { tanggal_data: 'desc' },
                    take: 1,
                },
            },
        });

        if (!dosenProfile) {
            return res.status(404).render('error', { message: 'Profil dosen tidak ditemukan.' });
        }

        // Siapkan data dosen untuk dikirim ke view EJS
        const dosenData = {
            userId: dosenProfile.id_user,
            nama_lengkap: dosenProfile.nama_lengkap,
            email: dosenProfile.email,
            bidang_keahlian: dosenProfile.jadwal_dosendosen?.[0]?.bidang_keahlian || 'Belum Ditentukan',
        };

        // 3. Ambil Jadwal Ketersediaan (Shift) untuk Hari Ini
        const today = new Date();
        
        // PERBAIKAN: Format tanggal dengan benar untuk query database
        // Pastikan timezone sesuai dengan server
        const todayDateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        console.log('Tanggal hari ini untuk query:', todayDateString);
        console.log('User ID:', dosenId);

        // Query dengan format tanggal yang tepat
        const scheduleFromDb = await prisma.jadwal_dosendosen.findFirst({
            where: {
                id_user: dosenId,
                // PERBAIKAN: Gunakan format tanggal yang tepat
                tanggal_data: {
                    gte: new Date(todayDateString + 'T00:00:00.000Z'),
                    lt: new Date(todayDateString + 'T23:59:59.999Z'),
                },
            },
            select: {
                tanggal_data: true,
                bidang_keahlian: true,
                shift1: true,
                shift2: true,
                shift3: true,
                shift4: true,
            },
        });

        console.log('Data jadwal dari DB:', scheduleFromDb);
        
        // 4. Proses Jadwal Menjadi Data Boolean yang Bersih untuk View
        let scheduleToday = {
            shift1: false,
            shift2: false,
            shift3: false,
            shift4: false,
        };

        if (scheduleFromDb) {
            // Helper function untuk konversi yang lebih aman
            const convertToBoolean = (value) => {
                if (value === null || value === undefined) return false;
                if (typeof value === 'boolean') return value;
                if (typeof value === 'string') {
                    const lowercaseValue = value.toLowerCase().trim();
                    return lowercaseValue === 'tersedia' || lowercaseValue === 'true' || lowercaseValue === '1';
                }
                if (typeof value === 'number') return value !== 0;
                return Boolean(value);
            };

            // Konversi nilai dari DB menjadi boolean murni
            scheduleToday = {
                shift1: convertToBoolean(scheduleFromDb.shift1),
                shift2: convertToBoolean(scheduleFromDb.shift2),
                shift3: convertToBoolean(scheduleFromDb.shift3),
                shift4: convertToBoolean(scheduleFromDb.shift4),
            };
        }

        // PERBAIKAN: Tambahkan data jadwal seminar untuk hari ini
        // Query untuk mendapatkan jadwal seminar yang sudah terdaftar untuk hari ini
        const jadwalSeminarHariIni = await prisma.jadwal_pendaftaran.findMany({
            where: {
                id_dosen: dosenId,
                tanggal_seminar: {
                    gte: new Date(todayDateString + 'T00:00:00.000Z'),
                    lt: new Date(todayDateString + 'T23:59:59.999Z'),
                },
                // Hanya ambil yang statusnya aktif/terjadwal
                status: {
                    in: ['TERJADWAL', 'AKTIF', 'PENDING']
                }
            },
            select: {
                id_jadwal: true,
                shift: true,
                waktu_mulai: true,
                waktu_selesai: true,
                status: true,
                // Relasi ke mahasiswa
                mahasiswa: {
                    select: {
                        nama_lengkap: true,
                        nim: true
                    }
                }
            },
            orderBy: {
                shift: 'asc'
            }
        });

        // Format jadwal seminar untuk ditampilkan
        const jadwalSeminarFormatted = jadwalSeminarHariIni.map(jadwal => ({
            id: jadwal.id_jadwal,
            shift: jadwal.shift,
            waktu: `${jadwal.waktu_mulai} - ${jadwal.waktu_selesai}`,
            mahasiswa: jadwal.mahasiswa?.nama_lengkap || 'Tidak diketahui',
            nim: jadwal.mahasiswa?.nim || '-',
            status: jadwal.status
        }));

        // Tambahkan logging untuk debugging
        console.log('Schedule Today:', scheduleToday);
        console.log('Dosen Data:', dosenData);
        console.log('Jadwal Seminar Hari Ini:', jadwalSeminarFormatted);

        // 5. Render Halaman dengan Semua Data yang Sudah Siap
        const renderData = {
            title: 'Dashboard Dosen',
            dosen: dosenData,
            uploadedScheduleToday: scheduleToday,
            jadwalPendaftaranHariIni: jadwalSeminarFormatted, // Data jadwal seminar yang sebenarnya
            currentDate: today,
            hasScheduleToday: scheduleFromDb !== null,
            // Tambahan info untuk debugging
            debugInfo: {
                queryDate: todayDateString,
                foundSchedule: scheduleFromDb !== null,
                scheduleData: scheduleFromDb,
                seminarCount: jadwalSeminarFormatted.length
            }
        };

        console.log('Render Data:', JSON.stringify(renderData, null, 2));

        // Disable caching for development
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        res.render('dosen/dashboard', renderData);

    } catch (error) {
        console.error('Terjadi kesalahan fatal di controller getDashboardD:', error);
        
        // Fallback data yang aman jika terjadi error
        const fallbackData = {
            title: 'Dashboard Dosen - Error',
            dosen: {
                userId: req.user?.userId || 'Unknown',
                nama_lengkap: 'Nama tidak tersedia',
                email: 'Email tidak tersedia',
                bidang_keahlian: 'Belum Ditentukan',
            },
            uploadedScheduleToday: {
                shift1: false,
                shift2: false,
                shift3: false,
                shift4: false,
            },
            jadwalPendaftaranHariIni: [],
            currentDate: new Date(),
            hasScheduleToday: false,
            error: true,
            errorMessage: error.message,
        };

        try {
            res.status(500).render('dosen/dashboard', fallbackData);
        } catch (renderError) {
            console.error('Error saat render fallback:', renderError);
            res.status(500).render('error', { 
                message: `Terjadi kesalahan dalam memuat dashboard: ${error.message}` 
            });
        }
    }
};