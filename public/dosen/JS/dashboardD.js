document.addEventListener('DOMContentLoaded', function() {
    // Fungsi ini akan dipanggil saat seluruh halaman HTML selesai dimuat

    function generateCalendar() {
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-indexed (Jan=0, Dec=11)
        const currentYear = now.getFullYear();
        const actualTodayDate = now.getDate(); // Angka hari ini (1-31)
        
        // Menggunakan Bahasa Indonesia untuk nama bulan
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        // Setel header bulan
        const monthHeader = document.getElementById('monthHeader');
        if (monthHeader) {
            monthHeader.textContent = monthNames[currentMonth] + ' ' + currentYear;
        }

        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) {
            console.error("Elemen dengan ID 'calendarGrid' tidak ditemukan.");
            return;
        }

        // Hapus hari-hari kalender yang ada (sisakan header hari S, M, T, W, T, F, S)
        // Kita hanya ingin menghapus elemen .calendar-day, bukan .calendar-day-header
        const existingDayElements = calendarGrid.querySelectorAll('.calendar-day');
        existingDayElements.forEach(dayElement => dayElement.remove());

        // Dapatkan hari pertama dalam sebulan dan jumlah hari dalam sebulan
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Minggu, 1=Senin,..
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Tambahkan sel kosong untuk hari sebelum bulan dimulai
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Tambahkan hari-hari dalam sebulan
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Logika 'today' yang lebih aman: bandingkan angka hari, bulan, dan tahun
            if (day === actualTodayDate && 
                currentMonth === now.getMonth() && 
                currentYear === now.getFullYear()) {
                dayElement.classList.add('today');
            }

            // Tambahkan event click (opsional untuk dashboard, karena data utama dari EJS)
            dayElement.addEventListener('click', function() {
                if (this.textContent.trim() !== '') { // Pastikan bukan sel kosong
                    // Hapus seleksi dari hari lain
                    const selectedDay = document.querySelector('.calendar-day.selected');
                    if (selectedDay) {
                        selectedDay.classList.remove('selected');
                    }
                    // Tambahkan seleksi ke hari yang diklik
                    this.classList.add('selected');
                    // Jika Anda ingin menampilkan detail jadwal untuk tanggal yang diklik (bukan hanya hari ini),
                    // Anda bisa menambahkan logika AJAX call di sini.
                }
            });

            calendarGrid.appendChild(dayElement);
        }
    }

    // Jalankan kalender HANYA SEKALI saat halaman dimuat.
    generateCalendar();

    // OPSIONAL: Jika Anda ingin kalender update otomatis saat tengah malam
    function scheduleNextCalendarUpdate() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow - now;

        setTimeout(() => {
            generateCalendar(); // Buat ulang kalender tepat saat tengah malam
            // Setelah update pertama di tengah malam, ulangi setiap 24 jam
            setInterval(generateCalendar, 24 * 60 * 60 * 1000); 
        }, msUntilMidnight);
    }
    
    // Panggil penjadwalan update
    scheduleNextCalendarUpdate(); 
});