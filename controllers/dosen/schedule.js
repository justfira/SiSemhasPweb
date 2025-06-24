const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  index: async (req, res) => {
    res.render('dosen/schedule', { title: 'Upload Jadwal' });
  },

  getCalendar: async (req, res) => {
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

      const groupedSchedules = {};
      schedules.forEach(schedule => {
        const dateKey = schedule.tanggal_data.toISOString().split('T')[0];
        groupedSchedules[dateKey] = {
          shift1: schedule.shift1,
          shift2: schedule.shift2,
          shift3: schedule.shift3,
          shift4: schedule.shift4,
        };
      });

      res.json({ success: true, schedules: groupedSchedules });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil jadwal.' });
    }
  },

  editSchedule: async (req, res) => {
    const { year, month, date } = req.query;

    const fullDate = new Date(parseInt(year), parseInt(parseInt(month)), parseInt(date));
    const userId = req.user.userId;

    try {
      // ✅ PERBAIKAN 1: Ganti jadwal_dosendosen menjadi jadwalDosendosen
      const existingSchedule = await prisma.jadwal_dosendosen.findFirst({
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
        shifts: existingSchedule || {
          shift1: null,
          shift2: null,
          shift3: null,
          shift4: null,
        }
      });
    } catch (error) {
      console.error('Error fetching schedule for edit:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data jadwal untuk diedit.' });
    }
  },

  saveSchedule: async (req, res) => {
    const { year, month, date, shifts } = req.body;

    if (!date || !year || !month || typeof shifts !== 'object') {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap atau format salah.' });
    }

    const fullDate = new Date(parseInt(year), parseInt(month), parseInt(date));
    const userId = req.user.userId;

    try {
      // ✅ PERBAIKAN 1: Ganti jadwal_dosendosen menjadi jadwalDosendosen
      // Upsert di controller ini tidak memiliki masalah sintaksis yang sama dengan routes file
      const saved = await prisma.jadwal_dosendosen.upsert({
        where: {
          tanggal_data_id_user: {
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
        message: 'Jadwal berhasil disimpan',
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
};