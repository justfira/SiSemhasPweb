// Lokasi: public/dosen/JS/penilaian.js
document.addEventListener('DOMContentLoaded', function() {
    
    // Seleksi Elemen DOM (tetap sama)
    const studentSelect = document.getElementById('studentSelect');
    const assessmentForm = document.getElementById('assessmentForm'); // Ini adalah form interaktif
    const scoreInputs = document.querySelectorAll('.score-input');
    const finalScoreEl = document.getElementById('finalScore'); // Nilai akhir di form interaktif
    const submitButton = document.querySelector('.btn-submit');
    const printButton = document.querySelector('.btn-print');
    const reviseButton = document.querySelector('.btn-revise');
    const statusSemhasSelect = document.getElementById('statusSemhas'); // Select status di form interaktif
    const komentarInput = document.getElementById('komentar'); // Textarea komentar di form interaktif

    // Seleksi elemen placeholder untuk laporan cetak (ada di div#printReportContent)
    const printStudentNamePlaceholder = document.getElementById('printStudentNamePlaceholder');
    const printStudentIdPlaceholder = document.getElementById('printStudentIdPlaceholder');
    const printDosenNamePlaceholder = document.getElementById('printDosenNamePlaceholder');
    const printDosenIdPlaceholder = document.getElementById('printDosenIdPlaceholder');
    const printJudulPenelitianPlaceholder = document.getElementById('printJudulPenelitianPlaceholder');
    const printDatePlaceholder = document.getElementById('printDatePlaceholder');

    // Seleksi elemen nilai akhir untuk print
    const printFinalScorePlaceholder = document.getElementById('print-final-score-cell'); // Ini adalah TD-nya
    // Seleksi elemen tanda tangan dosen untuk print
    const printDosenSignatureName = document.getElementById('printDosenSignatureName');
    const printDosenSignatureId = document.getElementById('printDosenSignatureId');
    const printCityDatePlaceholder = document.getElementById('printCityDatePlaceholder');

    // Seleksi placeholder Status & Komentar baru di bawah tabel
    const printStatusPlaceholder = document.getElementById('printStatusPlaceholder');
    const printKomentarPlaceholder = document.getElementById('printKomentarPlaceholder');


    // Ambil data dosen dari hidden input (Pastikan ID ini ada di EJS Anda)
    const loggedInDosenNama = document.getElementById('loggedInDosenNama') ? document.getElementById('loggedInDosenNama').value : '';
    const loggedInDosenId = document.getElementById('loggedInDosenId') ? document.getElementById('loggedInDosenId').value : '';


    // --- FUNGSI UTAMA ---

    async function fetchExistingScores(mahasiswaId) {
        resetForm(); // Reset form interaktif
        setFormDisabled(false); // Aktifkan form interaktif

        if (!mahasiswaId) {
            setFormDisabled(true);
            clearPrintPlaceholders(); // Bersihkan placeholder cetak
            clearPrintScoreAndCommentDataAttributes(); // Bersihkan data-attributes cetak
            return;
        }

        const selectedOption = studentSelect.options[studentSelect.selectedIndex];
        const isDinilai = selectedOption.dataset.isDinilai === 'true'; 
        const judulPenelitian = selectedOption.dataset.judulPenelitian || 'Tidak Ada Judul';

        // Logika untuk mengubah teks tombol Submit dan status tombol Revisi/Cetak
        if (isDinilai) {
            submitButton.textContent = 'Update Penilaian';
            reviseButton.disabled = false;
            printButton.disabled = false;
        } else {
            submitButton.textContent = 'Kirim Penilaian';
            reviseButton.disabled = true;
            printButton.disabled = true;
        }

        // --- Mengisi Placeholder Info Laporan (di luar tabel) ---
        if (printStudentNamePlaceholder) {
            printStudentNamePlaceholder.textContent = selectedOption.textContent.replace('(Sudah Dinilai)', '').trim();
        }
        if (printStudentIdPlaceholder) {
            printStudentIdPlaceholder.textContent = mahasiswaId;
        }
        if (printDosenNamePlaceholder) {
            printDosenNamePlaceholder.textContent = loggedInDosenNama;
        }
        if (printDosenIdPlaceholder) {
            printDosenIdPlaceholder.textContent = loggedInDosenId;
        }
        if (printJudulPenelitianPlaceholder) {
            printJudulPenelitianPlaceholder.textContent = judulPenelitian;
        }
        if (printDatePlaceholder) {
            const now = new Date();
            const options = { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit', 
                hour12: false 
            };
            const formatter = new Intl.DateTimeFormat('id-ID', options);
            printDatePlaceholder.textContent = formatter.format(now);
        }

        // Mengisi placeholder tanda tangan dosen di footer laporan cetak
        if (printDosenSignatureName) printDosenSignatureName.textContent = loggedInDosenNama;
        if (printDosenSignatureId) printDosenSignatureId.textContent = loggedInDosenId;
        if (printCityDatePlaceholder) {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            printCityDatePlaceholder.textContent = formatter.format(now);
        }
        // --- Akhir Mengisi Placeholder ---


        try {
            const response = await fetch(`/dosen/penilaian/api/nilai/${mahasiswaId}`);
            
            if (response.status === 404) {
                console.log('Belum ada penilaian untuk mahasiswa ini. Form siap diisi.');
                submitButton.textContent = 'Kirim Penilaian';
                reviseButton.disabled = true;
                printButton.disabled = true;
                
                clearPrintScoreAndCommentDataAttributes(); // Bersihkan data-attributes jika 404
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal mengambil data nilai yang ada.');
            }
            
            const existingData = await response.json();
            
            if (existingData) {
                if (existingData.scores) {
                    populateFormScores(existingData.scores); // Mengisi form interaktif
                    // Mengisi data-attributes skor untuk sel tabel cetak
                    scoreInputs.forEach(input => {
                        const scorePrintCell = document.getElementById(`print-score-${input.dataset.kategoriId}`);
                        if (scorePrintCell) {
                            scorePrintCell.dataset.scoreValue = input.value;
                        }
                    });
                } else {
                    // Kosongkan data-attributes skor jika scores null
                    scoreInputs.forEach(input => {
                        const scorePrintCell = document.getElementById(`print-score-${input.dataset.kategoriId}`);
                        if (scorePrintCell) scorePrintCell.dataset.scoreValue = '';
                    });
                }

                if (existingData.commentData) {
                    if (statusSemhasSelect) statusSemhasSelect.value = existingData.commentData.status_semhas;
                    if (komentarInput) komentarInput.value = existingData.commentData.komentar;
                    
                    // Mengisi data-attributes untuk placeholder status & komentar baru
                    if (printStatusPlaceholder) printStatusPlaceholder.textContent = existingData.commentData.status_semhas;
                    if (printKomentarPlaceholder) printKomentarPlaceholder.textContent = existingData.commentData.komentar;
                } else {
                     // Kosongkan placeholder status & komentar jika commentData null
                    if (printStatusPlaceholder) printStatusPlaceholder.textContent = '';
                    if (printKomentarPlaceholder) printKomentarPlaceholder.textContent = '';
                }
                
                // Mengisi nilai akhir untuk laporan cetak
                if (printFinalScorePlaceholder) {
                    printFinalScorePlaceholder.textContent = finalScoreEl.textContent;
                }

                reviseButton.disabled = false;
                printButton.disabled = false;
                submitButton.textContent = 'Update Penilaian';
            }
        } catch (error) {
            console.error('Error fetching existing scores:', error);
            alert(`Terjadi kesalahan: ${error.message}`);
            setFormDisabled(true);
            clearPrintScoreAndCommentDataAttributes(); // Kosongkan jika ada error
        }
    }

    function calculateScores() {
        let totalFinalScore = 0;
        scoreInputs.forEach(input => {
            const nilai = parseFloat(input.value) || 0;
            const bobot = parseFloat(input.dataset.weight) || 0;
            const skorTerbobot = (nilai * bobot);
            totalFinalScore += skorTerbobot;
        });
        finalScoreEl.textContent = totalFinalScore.toFixed(2);

        // Update print Final Score placeholder saat nilai berubah di form interaktif
        if (printFinalScorePlaceholder) {
            printFinalScorePlaceholder.textContent = finalScoreEl.textContent;
        }

        // Update data-attributes skor saat nilai berubah di form interaktif
        scoreInputs.forEach(input => {
            const scorePrintCell = document.getElementById(`print-score-${input.dataset.kategoriId}`);
            if (scorePrintCell) {
                scorePrintCell.dataset.scoreValue = input.value;
            }
        });
    }

    async function submitAssessment(event) {
        event.preventDefault();
        const selectedStudentId = studentSelect.value;
        
        if (!selectedStudentId) {
            alert('Silakan pilih nama mahasiswa terlebih dahulu.');
            return;
        }

        const scores = {};
        scoreInputs.forEach(input => {
            scores[input.dataset.kategoriId] = parseFloat(input.value) || 0;
        });

        const statusSemhas = statusSemhasSelect.value;
        const komentar = komentarInput.value;

        if (!statusSemhas) {
            alert('Status Seminar Hasil wajib diisi.');
            return;
        }

        const dataToSubmit = {
            mahasiswaId: selectedStudentId,
            scores: scores,
            status_semhas: statusSemhas,
            komentar: komentar
        };

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Menyimpan...';

            const response = await fetch('/dosen/penilaian/api/penilaian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit),
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Gagal menyimpan penilaian');
            }
            
            alert('Penilaian berhasil disimpan!');
            window.location.reload();

        } catch (error) {
            alert(`Terjadi kesalahan: ${error.message}`);
        } finally {
            submitButton.disabled = false;
        }
    }

    // --- FUNGSI BANTU ---

    function populateFormScores(scoresObject) {
        for (const key in scoresObject) {
            if (scoresObject.hasOwnProperty(key)) {
                const input = document.querySelector(`.score-input[data-kategori-id='${key}']`);
                if (input) {
                    input.value = parseFloat(scoresObject[key]); 
                }
            }
        }
        calculateScores();
    }

    function resetForm() {
        assessmentForm.reset();
        finalScoreEl.textContent = '0.00';
        if (statusSemhasSelect) statusSemhasSelect.value = '';
        if (komentarInput) komentarInput.value = '';
        clearPrintScoreAndCommentDataAttributes(); // Tambahkan ini di reset form
        // Also clear info placeholders when resetting form
        clearPrintPlaceholders();
    }
    
    function setFormDisabled(disabled) {
        scoreInputs.forEach(input => input.disabled = disabled);
        submitButton.disabled = disabled;
        printButton.disabled = disabled;
        reviseButton.disabled = disabled;
        if (statusSemhasSelect) statusSemhasSelect.disabled = disabled;
        if (komentarInput) komentarInput.disabled = disabled;
    }

    // Fungsi untuk membersihkan semua placeholder info laporan (di luar tabel)
    function clearPrintPlaceholders() {
        if (printStudentNamePlaceholder) printStudentNamePlaceholder.textContent = '';
        if (printStudentIdPlaceholder) printStudentIdPlaceholder.textContent = '';
        if (printDosenNamePlaceholder) printDosenNamePlaceholder.textContent = '';
        if (printDosenIdPlaceholder) printDosenIdPlaceholder.textContent = '';
        if (printJudulPenelitianPlaceholder) printJudulPenelitianPlaceholder.textContent = '';
        if (printDatePlaceholder) printDatePlaceholder.textContent = '';
        if (printDosenSignatureName) printDosenSignatureName.textContent = '';
        if (printDosenSignatureId) printDosenSignatureId.textContent = '';
        if (printCityDatePlaceholder) printCityDatePlaceholder.textContent = '';
    }

    // Fungsi baru untuk membersihkan data-attributes di sel tabel cetak
    function clearPrintScoreAndCommentDataAttributes() {
        // Bersihkan skor
        scoreInputs.forEach(input => {
            const scorePrintCell = document.getElementById(`print-score-${input.dataset.kategoriId}`);
            if (scorePrintCell) {
                scorePrintCell.dataset.scoreValue = '';
            }
        });
        // Bersihkan status dan komentar
        if (printStatusPlaceholder) printStatusPlaceholder.textContent = '';
        if (printKomentarPlaceholder) printKomentarPlaceholder.textContent = '';
        // Bersihkan nilai akhir
        if (printFinalScorePlaceholder) printFinalScorePlaceholder.textContent = '0.00';
    }


    // --- EVENT LISTENERS ---

    studentSelect.addEventListener('change', () => {
        fetchExistingScores(studentSelect.value);
    });

    scoreInputs.forEach(input => input.addEventListener('input', calculateScores));
    // Update data-attributes untuk status dan komentar saat ada perubahan di form interaktif
    if (statusSemhasSelect) {
        statusSemhasSelect.addEventListener('input', () => {
            if (printStatusPlaceholder) printStatusPlaceholder.textContent = statusSemhasSelect.value;
        });
    }
    if (komentarInput) {
        komentarInput.addEventListener('input', () => {
            if (printKomentarPlaceholder) printKomentarPlaceholder.textContent = komentarInput.value;
        });
    }


    assessmentForm.addEventListener('submit', submitAssessment);

    printButton.addEventListener('click', () => {
        if (!studentSelect.value) {
            alert('Pilih mahasiswa terlebih dahulu untuk mencetak.');
            return;
        }
        window.print();
    });

    reviseButton.addEventListener('click', () => {
        if (!studentSelect.value) {
            alert('Pilih mahasiswa terlebih dahulu untuk merevisi.');
            return;
        }
        
        const confirmRevise = confirm('Anda yakin ingin merevisi penilaian ini? Status seminar akan diubah menjadi "REVISI".');
        if (!confirmRevise) {
            return;
        }

        if (statusSemhasSelect) {
            statusSemhasSelect.value = 'REVISI';
            // Pastikan placeholder status juga terupdate
            if (printStatusPlaceholder) printStatusPlaceholder.textContent = 'REVISI';
        }
        
        alert('Form penilaian siap untuk direvisi. Silakan ubah nilai atau komentar dan klik "Update Penilaian".');
    });

    // --- INISIALISASI SAAT HALAMAN DIMUAT ---
    if (studentSelect.value) {
        fetchExistingScores(studentSelect.value);
    } else {
        setFormDisabled(true);
        clearPrintPlaceholders();
        clearPrintScoreAndCommentDataAttributes();
    }
});