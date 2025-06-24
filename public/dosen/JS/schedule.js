class ScheduleManager {
    constructor() {
        this.selectedYear = new Date().getFullYear();
        this.selectedMonth = null; // 0-indexed (Jan = 0, Des = 11)
        this.selectedDate = null;
        this.schedules = {}; // Akan menyimpan jadwal dalam format { 'YYYY-MM-DD': { shift1: '...', ... } }
        this.csrfToken = null; // Untuk CSRF token
        this.init();
    }

    init() {
        this.setupCSRF();
        this.populateYearSelect(); // Isi dropdown tahun
        this.setupListeners();
        this.updateMonthButtons(); // Update status tombol bulan saat init

        // Cek apakah ada parameter URL untuk langsung menampilkan kalender
        const urlParams = new URLSearchParams(window.location.search);
        const yearParam = urlParams.get('year');
        const monthParam = urlParams.get('month');

        if (yearParam && monthParam) {
            this.selectedYear = parseInt(yearParam);
            this.selectedMonth = parseInt(monthParam) - 1; // Konversi ke 0-indexed
            document.getElementById('year-select').value = this.selectedYear;
            this.showCalendar();
        } else {
            // Jika tidak ada parameter tahun/bulan di URL, default ke bulan dan tahun saat ini
            const now = new Date();
            this.selectedYear = now.getFullYear();
            this.selectedMonth = now.getMonth();
            this.showMonthSelection(); // Tampilkan seleksi bulan default
        }
    }

    setupCSRF() {
        const tokenMeta = document.querySelector('meta[name="csrf-token"]');
        if (tokenMeta) {
            this.csrfToken = tokenMeta.getAttribute('content');
        }
    }

    populateYearSelect() {
        const yearSelect = document.getElementById('year-select');
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 1; y <= currentYear + 5; y++) { // Misal dari tahun lalu sampai 5 tahun ke depan
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            yearSelect.appendChild(opt);
        }
    }

    setupListeners() {
        document.getElementById('year-select').onchange = e => {
            this.selectedYear = +e.target.value;
            this.updateMonthButtons();
        };
        document.querySelectorAll('.month-btn').forEach(btn =>
            btn.onclick = () => this.selectMonth(+btn.dataset.month) // data-month sudah 0-indexed
        );
        document.getElementById('back-btn').onclick = () => this.showMonthSelection();
        document.getElementById('close-modal').onclick = () => this.closeModal();
        document.getElementById('cancel-btn').onclick = () => this.closeModal();
        document.getElementById('save-btn').onclick = () => this.saveSchedule();
        document.getElementById('schedule-modal').onclick = e => {
            if (e.target.id === 'schedule-modal') this.closeModal();
        };
        document.getElementById('prev-month').onclick = () => this.changeMonth(-1);
        document.getElementById('next-month').onclick = () => this.changeMonth(1);
    }

    updateMonthButtons() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        document.querySelectorAll('.month-btn').forEach(btn => {
            const monthBtnValue = +btn.dataset.month; // 0-indexed dari HTML

            const isActive = (this.selectedYear > currentYear) ||
                             (this.selectedYear === currentYear && monthBtnValue >= currentMonth);

            btn.disabled = !isActive;
            btn.classList.toggle('disabled', !isActive); // Tambahkan/hapus kelas disabled

            // Hapus kelas 'active' dari semua tombol, lalu tambahkan ke yang sedang aktif
            btn.classList.remove('active'); // Hapus 'active' dari semua bulan
            if (this.selectedMonth !== null && monthBtnValue === this.selectedMonth) {
                btn.classList.add('selected'); // Gunakan 'selected' atau 'active' sesuai CSS
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    selectMonth(month) {
        this.selectedMonth = month; // Bulan 0-indexed
        this.showCalendar();
    }

    showMonthSelection() {
        document.getElementById('month-selection').classList.add('active');
        document.getElementById('calendar-view').classList.remove('active');
        // Reset URL params saat kembali ke pemilihan bulan
        window.history.pushState({}, '', '/dosen/schedule'); // Kembali ke /dosen/schedule atau URL utama yang Anda inginkan
    }

    showCalendar() {
        document.getElementById('month-selection').classList.remove('active');
        document.getElementById('calendar-view').classList.add('active');
        this.renderTitle();
        this.generateCalendar();
        this.loadSchedules();
        // Update URL params
        // Menggunakan /dosen/schedule sebagai base URL untuk kalender
        window.history.pushState({}, '', `/dosen/schedule?year=${this.selectedYear}&month=${this.selectedMonth + 1}`);
    }

    renderTitle() {
        const names = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        document.getElementById('calendar-title').textContent =
            `${names[this.selectedMonth]} ${this.selectedYear}`;
    }

    generateCalendar() {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        // Hapus kelas 'selected' dari hari sebelumnya
        const prevSelected = grid.querySelector('.calendar-day.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 1).getDay(); // 0 = Minggu, 6 = Sabtu
        const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();

        // Tambahkan sel kosong untuk mengisi hari-hari sebelum tanggal 1
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            grid.appendChild(emptyCell);
        }

        const now = new Date(); // Tanggal dan waktu sekarang
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Hari ini, pukul 00:00:00

        // Batas 1 minggu dari sekarang (7 hari ke depan dari hari ini)
        const oneWeekFromNowAtMidnight = new Date(todayAtMidnight);
        oneWeekFromNowAtMidnight.setDate(todayAtMidnight.getDate() + 7);

        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-day');
            cell.textContent = d;

            const dateBeingRendered = new Date(this.selectedYear, this.selectedMonth, d); // Tanggal yang sedang dirender, pukul 00:00:00

            // LOGIKA PENONAKTIFAN TANGGAL:
            // Tanggal dinonaktifkan jika:
            // Sudah lewat satu minggu dari sekarang (tanggal yang dirender < oneWeekFromNowAtMidnight)
            const isDisabled = dateBeingRendered < oneWeekFromNowAtMidnight;

            if (isDisabled) {
                cell.classList.add('disabled');
                // Tidak perlu menambahkan onclick jika disabled
            } else {
                // Hanya tambahkan onclick jika tanggal tidak disabled
                cell.onclick = () => this.openModal(d);
            }

            const dateKey = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // Tambahkan kelas 'has-schedule' jika ada data shift untuk tanggal ini (salah satu shift tidak null)
            const hasAnySchedule = this.schedules[dateKey] &&
                                   (this.schedules[dateKey].shift1 ||
                                    this.schedules[dateKey].shift2 ||
                                    this.schedules[dateKey].shift3 ||
                                    this.schedules[dateKey].shift4);

            if (hasAnySchedule) {
                cell.classList.add('has-schedule');
            }

            // Tandai hari ini (jika bukan disabled)
            if (dateBeingRendered.getTime() === todayAtMidnight.getTime() && !isDisabled) {
                cell.classList.add('today');
            }
            // Jika hari ini tapi disabled, tetap tampilkan sebagai disabled saja
            else if (dateBeingRendered.getTime() === todayAtMidnight.getTime() && isDisabled) {
                 cell.classList.add('today-disabled'); // Anda bisa tambahkan styling khusus untuk 'hari ini' yang disabled
            }

            grid.appendChild(cell);
        }
    }

    loadSchedules() {
        fetch(`/dosen/get-calendar?year=${this.selectedYear}&month=${this.selectedMonth}`)
            .then(async r => { // Menggunakan async/await di sini untuk penanganan error JSON yang lebih baik
                if (!r.ok) {
                    const errorText = await r.text(); // Coba baca body error sebagai teks
                    throw new Error(`HTTP error! status: ${r.status}, response: ${errorText}`);
                }
                return r.json();
            })
            .then(res => {
                if (res.success) {
                    this.schedules = res.schedules || {};
                    this.generateCalendar(); // Regenerate calendar with loaded data
                } else {
                    console.error('Failed to load schedules:', res.message);
                    alert('Gagal memuat jadwal: ' + (res.message || 'Unknown error')); // Tampilkan pesan dari server jika ada
                }
            })
            .catch(error => {
                console.error('Error loading schedules:', error);
                alert('Terjadi kesalahan saat memuat jadwal. Detail: ' + error.message); // Tampilkan detail error
            });
    }

    openModal(day) {
        this.selectedDate = day;
        const currentYear = this.selectedYear;
        const currentMonth = this.selectedMonth; // 0-indexed

        // Hapus kelas 'selected' dari hari sebelumnya dan tambahkan ke hari yang baru dipilih
        const grid = document.getElementById('calendar-grid');
        const prevSelected = grid.querySelector('.calendar-day.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        let targetCell = null;
        const allDayCells = grid.querySelectorAll('.calendar-day:not(.empty)');
        for(let i=0; i < allDayCells.length; i++) {
            if (parseInt(allDayCells[i].textContent) === day) {
                targetCell = allDayCells[i];
                break;
            }
        }

        if (targetCell) {
            targetCell.classList.add('selected');
        }

        // Fetch data untuk shift dari backend
        fetch(`/dosen/edit-schedule?year=${currentYear}&month=${currentMonth}&date=${day}`)
            .then(async r => { // Menggunakan async/await di sini untuk penanganan error JSON yang lebih baik
                if (!r.ok) {
                    const errorText = await r.text(); // Coba baca body error sebagai teks
                    throw new Error(`HTTP error! status: ${r.status}, response: ${errorText}`);
                }
                return r.json();
            })
            .then(res => {
                if (res.success) {
                    document.getElementById('modal-title').textContent = `Edit Jadwal - ${res.date} ${this.getMonthName(currentMonth)} ${currentYear}`;

                    // Set status checkbox dan placeholder input
                    for (let i = 1; i <= 4; i++) { // Iterasi dari shift1 sampai shift4
                        const shiftCheckbox = document.getElementById(`shift-checkbox-${i}`);
                        const shiftInput = document.getElementById(`shift-input-${i}`);
                        const shiftData = res.shifts[`shift${i}`];

                        if (shiftCheckbox && shiftInput) {
                            if (shiftData) {
                                shiftCheckbox.checked = false; // Berarti tidak kosong (ada isinya)
                                shiftInput.value = shiftData;
                                shiftInput.placeholder = 'Kegiatan seminar';
                                shiftInput.readOnly = false;
                            } else {
                                shiftCheckbox.checked = true; // Berarti kosong/tersedia
                                shiftInput.value = '';
                                shiftInput.placeholder = 'Kosong / Tersedia';
                                shiftInput.readOnly = true;
                            }
                            shiftCheckbox.onchange = () => {
                                if (shiftCheckbox.checked) {
                                    shiftInput.value = '';
                                    shiftInput.placeholder = 'Kosong / Tersedia';
                                    shiftInput.readOnly = true;
                                } else {
                                    shiftInput.placeholder = 'Masukkan kegiatan seminar';
                                    shiftInput.readOnly = false;
                                    shiftInput.focus();
                                }
                            };
                        }
                    }
                    document.getElementById('schedule-modal').classList.add('active');
                } else {
                    console.error('Failed to edit schedule:', res.message);
                    alert('Gagal mengambil data jadwal untuk diedit: ' + (res.message || 'Unknown error')); // Tampilkan pesan dari server jika ada
                }
            })
            .catch(error => {
                console.error('Error opening modal:', error);
                alert('Terjadi kesalahan saat membuka modal. Detail: ' + error.message); // Tampilkan detail error
            });
    }

    closeModal() {
        document.getElementById('schedule-modal').classList.remove('active');
        const grid = document.getElementById('calendar-grid');
        const selectedCell = grid.querySelector('.calendar-day.selected');
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
    }

    saveSchedule() {
        const shifts = {};
        for (let i = 1; i <= 4; i++) {
            const shiftCheckbox = document.getElementById(`shift-checkbox-${i}`);
            const shiftInput = document.getElementById(`shift-input-${i}`);

            if (shiftCheckbox && shiftInput) {
                if (shiftCheckbox.checked) {
                    shifts[`shift${i}`] = null;
                } else {
                    shifts[`shift${i}`] = shiftInput.value.trim() || null;
                }
            }
        }

        fetch('/dosen/save-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': this.csrfToken
            },
            body: JSON.stringify({
                year: this.selectedYear,
                month: this.selectedMonth,
                date: this.selectedDate,
                shifts: shifts
            })
        })
        .then(async r => { // Menggunakan async/await di sini untuk penanganan error JSON yang lebih baik
            if (!r.ok) {
                const errorText = await r.text(); // Coba baca body error sebagai teks
                throw new Error(`HTTP error! status: ${r.status}, response: ${errorText}`);
            }
            return r.json();
        })
        .then(res => {
            if (res.success) {
                alert('Jadwal berhasil disimpan!');
                const dateKey = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}-${String(this.selectedDate).padStart(2, '0')}`;
                this.schedules[dateKey] = res.data.shifts;
                this.generateCalendar();
                this.closeModal();
            } else {
                alert('Gagal menyimpan jadwal: ' + (res.message || 'Unknown error')); // Tampilkan pesan dari server jika ada
            }
        })
        .catch(error => {
            console.error('Error saving schedule:', error);
            alert('Terjadi kesalahan saat menyimpan jadwal. Detail: ' + error.message); // Tampilkan detail error
        });
    }

    changeMonth(offset) {
        let newYear = this.selectedYear;
        let newMonth = this.selectedMonth + offset;

        if (newMonth < 0) {
            newYear--;
            newMonth = 11;
        }
        if (newMonth > 11) {
            newYear++;
            newMonth = 0;
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Logika batasan bulan tetap sama.
        // Jika Anda ingin mengizinkan melihat bulan lalu tetapi tidak mengeditnya, logika ini mungkin perlu disesuaikan.
        // Namun untuk 'upload jadwal' yang umumnya ke depan, ini sudah sesuai.
        if (newYear < currentYear || (newYear === currentYear && newMonth < currentMonth)) {
            // Jika bulan baru adalah bulan ini, izinkan
            if (newYear === currentYear && newMonth === currentMonth) {
                this.selectedYear = newYear;
                this.selectedMonth = newMonth;
            } else {
                alert('Tidak dapat melihat jadwal bulan sebelumnya.');
                return;
            }
        } else {
            this.selectedYear = newYear;
            this.selectedMonth = newMonth;
        }

        this.updateMonthButtons();
        this.showCalendar();
    }

    getMonthName(monthIndex) {
        const names = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        return names[monthIndex];
    }
}

document.addEventListener('DOMContentLoaded', () => new ScheduleManager());