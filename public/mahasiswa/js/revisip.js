// Menunggu DOM selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi semua fungsi
    initFileUpload();
    initFormSubmission();
    initNavigation();
});

// Fungsi untuk menangani file upload
function initFileUpload() {
    const fileInputs = document.querySelectorAll('.file-input');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            handleFileSelect(e);
        });
    });
}

// Menangani pemilihan file
function handleFileSelect(event) {
    const input = event.target;
    const container = input.closest('.file-input-container');
    const label = container.querySelector('.file-label');
    const textSpan = label.querySelector('.file-text');
    
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);
        
        // Validasi file
        if (validateFile(file, input.id)) {
            // Update tampilan dengan nama file
            textSpan.textContent = `${fileName} (${fileSize})`;
            container.classList.add('file-uploaded');
            
            // Animasi sukses
            showSuccessAnimation(container);
        } else {
            // Reset jika file tidak valid
            input.value = '';
            textSpan.textContent = 'Pilih File';
            container.classList.remove('file-uploaded');
        }
    } else {
        // Reset jika tidak ada file
        textSpan.textContent = 'Pilih File';
        container.classList.remove('file-uploaded');
    }
}

// Validasi file berdasarkan tipe dan ukuran
function validateFile(file, inputId) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = {
        'pptFile': ['.ppt', '.pptx', '.pdf'],
        'laporanFile': ['.doc', '.docx', '.pdf']
    };
    
    // Cek ukuran file
    if (file.size > maxSize) {
        showNotification('File terlalu besar! Maksimal 10MB.', 'error');
        return false;
    }
    
    // Cek tipe file
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const allowedExtensions = allowedTypes[inputId] || [];
    
    if (!allowedExtensions.includes(fileExtension)) {
        const allowedStr = allowedExtensions.join(', ');
        showNotification(`Tipe file tidak didukung! Gunakan: ${allowedStr}`, 'error');
        return false;
    }
    
    return true;
}

// Format ukuran file
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Animasi sukses upload
function showSuccessAnimation(container) {
    container.style.transform = 'scale(1.02)';
    setTimeout(() => {
        container.style.transform = 'scale(1)';
    }, 200);
}

// Inisialisasi form submission
function initFormSubmission() {
    const uploadForm = document.getElementById('uploadForm');
    const jadwalForm = document.getElementById('jadwalForm');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
    
    if (jadwalForm) {
        jadwalForm.addEventListener('submit', handleJadwalSubmit);
    }
}

// Menangani submit form upload
function handleUploadSubmit(event) {
    event.preventDefault();
    
    const pptFile = document.getElementById('pptFile').files[0];
    const laporanFile = document.getElementById('laporanFile').files[0];
    const submitBtn = event.target.querySelector('.submit-btn');
    
    // Validasi minimal salah satu file harus diupload
    if (!pptFile && !laporanFile) {
        showNotification('Pilih minimal satu file untuk diupload!', 'warning');
        return;
    }
    
    // Simulasi upload
    simulateUpload(submitBtn, () => {
        showNotification('File berhasil diupload!', 'success');
        
        // Log informasi file yang diupload
        console.log('Files uploaded:', {
            ppt: pptFile ? pptFile.name : null,
            laporan: laporanFile ? laporanFile.name : null
        });
    });
}

// Menangani submit form jadwal
function handleJadwalSubmit(event) {
    event.preventDefault();
    
    const jadwalSelect = document.getElementById('jadwalSelect');
    const selectedValue = jadwalSelect.value;
    const selectedText = jadwalSelect.options[jadwalSelect.selectedIndex].text;
    const submitBtn = event.target.querySelector('.submit-btn');
    
    if (!selectedValue) {
        showNotification('Pilih jadwal seminar terlebih dahulu!', 'warning');
        jadwalSelect.focus();
        return;
    }
    
    // Simulasi penyimpanan jadwal
    simulateSubmission(submitBtn, () => {
        showNotification(`Jadwal berhasil dipilih: ${selectedText}`, 'success');
        
        // Log jadwal yang dipilih
        console.log('Jadwal selected:', {
            value: selectedValue,
            text: selectedText
        });
    });
}

// Simulasi proses upload/submit
function simulateUpload(button, callback) {
    button.classList.add('loading');
    button.disabled = true;
    
    // Simulasi waktu upload (2-4 detik)
    const uploadTime = Math.random() * 2000 + 2000;
    
    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        callback();
    }, uploadTime);
}

// Simulasi proses submission biasa
function simulateSubmission(button, callback) {
    button.classList.add('loading');
    button.disabled = true;
    
    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        callback();
    }, 1000);
}

// Sistem notifikasi
function showNotification(message, type = 'info') {
    // Hapus notifikasi sebelumnya jika ada
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Tambahkan style notifikasi
    addNotificationStyles();
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Event listener untuk tombol close
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto hide setelah 5 detik
    setTimeout(() => {
        if (notification.parentNode) {
            hideNotification(notification);
        }
    }, 5000);
    
    // Animasi masuk
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Dapatkan icon berdasarkan tipe notifikasi
function getNotificationIcon(type) {
    const icons = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠',
        'info': 'ℹ'
    };
    return icons[type] || icons['info'];
}

// Sembunyikan notifikasi
function hideNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Tambahkan style untuk notifikasi
function addNotificationStyles() {
    if (document.querySelector('#notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.hide {
            transform: translateX(100%);
        }
        
        .notification-content {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        
        .notification-success .notification-content {
            border-left-color: #28a745;
            background: #f8fff9;
        }
        
        .notification-error .notification-content {
            border-left-color: #dc3545;
            background: #fff8f8;
        }
        
        .notification-warning .notification-content {
            border-left-color: #ffc107;
            background: #fffef8;
        }
        
        .notification-icon {
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .notification-success .notification-icon {
            color: #28a745;
        }
        
        .notification-error .notification-icon {
            color: #dc3545;
        }
        
        .notification-warning .notification-icon {
            color: #ffc107;
        }
        
        .notification-message {
            flex: 1;
            color: #333;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #999;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            color: #666;
        }
        
        @media (max-width: 480px) {
            .notification {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
                transform: translateY(-100%);
            }
            
            .notification.show {
                transform: translateY(0);
            }
            
            .notification.hide {
                transform: translateY(-100%);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Inisialisasi navigasi
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Jika link tidak memiliki href yang valid, prevent default
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Log navigasi
            console.log('Navigation:', this.textContent);
        });
    });
}

// Fungsi utility untuk debugging
function debugInfo() {
    console.log('SiSemhas System Debug Info:', {
        uploadForm: document.getElementById('uploadForm'),
        jadwalForm: document.getElementById('jadwalForm'),
        fileInputs: document.querySelectorAll('.file-input').length,
        navLinks: document.querySelectorAll('.nav-link').length
    });
}

// Event listener untuk key shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl + D untuk debug info
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        debugInfo();
    }
    
    // Escape untuk tutup notifikasi
    if (event.key === 'Escape') {
        const notification = document.querySelector('.notification');
        if (notification) {
            hideNotification(notification);
        }
    }
});

// Fungsi untuk ekspor data (jika diperlukan)
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        uploadedFiles: [],
        selectedSchedule: null
    };
    
    // Ambil informasi file yang diupload
    const pptFile = document.getElementById('pptFile').files[0];
    const laporanFile = document.getElementById('laporanFile').files[0];
    
    if (pptFile) {
        data.uploadedFiles.push({
            type: 'ppt',
            name: pptFile.name,
            size: pptFile.size
        });
    }
    
    if (laporanFile) {
        data.uploadedFiles.push({
            type: 'laporan',
            name: laporanFile.name,
            size: laporanFile.size
        });
    }
    
    // Ambil jadwal yang dipilih
    const jadwalSelect = document.getElementById('jadwalSelect');
    if (jadwalSelect.value) {
        data.selectedSchedule = {
            value: jadwalSelect.value,
            text: jadwalSelect.options[jadwalSelect.selectedIndex].text
        };
    }
    
    return data;
}

// Auto-save draft (simpan ke localStorage jika diperlukan)
function saveDraft() {
    const draft = exportData();
    // localStorage.setItem('sisemhas_draft', JSON.stringify(draft));
    console.log('Draft saved:', draft);
}

// Load draft
function loadDraft() {
    // const draft = localStorage.getItem('sisemhas_draft');
    // if (draft) {
    //     const data = JSON.parse(draft);
    //     console.log('Draft loaded:', data);
    // }
}

// Panggil load draft saat halaman dimuat
// loadDraft();