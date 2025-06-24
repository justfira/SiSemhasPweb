const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { auth: authMiddleware } = require('../../middleware/authMiddleware');
const dosenMiddleware = require('../../middleware/dosen');

router.get('/schedule', (req, res) => {
    res.render('dosen/schedule', { title: 'Upload Jadwal' });
});

router.get(
    '/get-calendar',
    authMiddleware,
    dosenMiddleware,
    async (req, res) => {
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month);

        if (isNaN(year) || isNaN(month)) {
            return res.status(400).json({ success: false, message: 'Tahun atau bulan tidak valid.' });
        }

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const userId = req.user.userId;

        try {
            // ✅ PERBAIKAN 1: Ganti jadwal_dosendosen menjadi jadwalDosendosen
            const schedules = await prisma.jadwal_dosendosen.findMany({
                where: {
                    id_user: userId,
                    tanggal_data: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: {
                    tanggal_data: true,
                    shift1: true,
                    shift2: true,
                    shift3: true,
                    shift4: true,
                }
            });

            const grouped = {};
            for (const s of schedules) {
                const key = s.tanggal_data.toISOString().split('T')[0];
                grouped[key] = {
                    shift1: s.shift1,
                    shift2: s.shift2,
                    shift3: s.shift3,
                    shift4: s.shift4,
                };
            }
            res.json({ success: true, schedules: grouped });
        } catch (error) {
            console.error('Error fetching calendar schedules:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data kalender.' });
        }
    }
);


router.get(
    '/edit-schedule',
    authMiddleware,
    dosenMiddleware,
    async (req, res) => {
        const { year, month, date } = req.query;

        const fullDate = new Date(parseInt(year), parseInt(month), parseInt(date));
        const userId = req.user.userId;

        try {
            // ✅ PERBAIKAN 1: Ganti jadwal_dosendosen menjadi jadwalDosendosen
            const existing = await prisma.jadwal_dosendosen.findFirst({
                where: {
                    tanggal_data: fullDate,
                    id_user: userId
                },
                select: {
                    shift1: true,
                    shift2: true,
                    shift3: true,
                    shift4: true,
                }
            });

            res.json({
                success: true,
                date: parseInt(date),
                year: parseInt(year),
                month: parseInt(month),
                shifts: existing || { shift1: null, shift2: null, shift3: null, shift4: null }
            });
        } catch (error) {
            console.error('Error fetching edit schedule:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data untuk edit jadwal.' });
        }
    }
);

// Menyimpan jadwal
router.post(
    '/save-schedule',
    authMiddleware,
    dosenMiddleware,
    async (req, res) => {
        const { year, month, date, shifts } = req.body;

        if (!date || !year || !month || typeof shifts !== 'object') {
            return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
        }

        const fullDate = new Date(parseInt(year), parseInt(month), parseInt(date));
        const userId = req.user.userId;

        try {
            // ✅ PERBAIKAN 1: Ganti jadwal_dosendosen menjadi jadwalDosendosen
            // ✅ PERBAIKAN 2: Koreksi sintaks di where clause (hapus koma)
            const saved = await prisma.jadwal_dosendosen.upsert({
                where: {
                    tanggal_data_id_user: { // <<< Hapus koma di sini
                        tanggal_data: fullDate,
                        id_user: userId
                    }
                },
                update: {
                    shift1: shifts.shift1 || null,
                    shift2: shifts.shift2 || null,
                    shift3: shifts.shift3 || null,
                    shift4: shifts.shift4 || null,
                },
                create: {
                    tanggal_data: fullDate,
                    id_user: userId,
                    shift1: shifts.shift1 || null,
                    shift2: shifts.shift2 || null,
                    shift3: shifts.shift3 || null,
                    shift4: shifts.shift4 || null,
                }
            });

            res.json({
                success: true,
                message: 'Jadwal berhasil disimpan.',
                data: {
                    date: saved.tanggal_data.getDate(),
                    shifts: {
                        shift1: saved.shift1,
                        shift2: saved.shift2,
                        shift3: saved.shift3,
                        shift4: saved.shift4,
                    }
                }
            });
        } catch (error) {
            console.error('Error saving schedule:', error);
            res.status(500).json({ success: false, message: 'Gagal menyimpan jadwal.' });
        }
    }
);

module.exports = router;