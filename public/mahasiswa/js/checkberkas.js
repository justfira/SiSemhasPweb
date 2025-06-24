document.addEventListener('DOMContentLoaded', () => {
    const fileModal = document.getElementById('fileModal');
    const closeButton = document.querySelector('.modal .close');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    // Fungsi untuk membuka modal
    function openModal() {
        fileModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent body scroll when modal is open
    }

    // Fungsi untuk menutup modal
    function closeModal() {
        fileModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore body scroll
        modalContent.innerHTML = ''; // Bersihkan konten modal saat ditutup
    }

    // Event listener untuk tombol tutup modal
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Tutup modal jika user klik di luar area modal
    window.addEventListener('click', (event) => {
        if (event.target === fileModal) {
            closeModal();
        }
    });

    // Tutup modal dengan ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && fileModal.style.display === 'block') {
            closeModal();
        }
    });

    // Fungsi untuk menampilkan loading state
    function showLoading(message = 'Memuat...') {
        modalContent.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 20px;">
                <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p>${message}</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    // Fungsi untuk menampilkan error
    function showError(message, type) {
        modalContent.innerHTML = `
            <div class="error-container" style="text-align: center; padding: 20px;">
                <div style="color: #e74c3c; font-size: 48px; margin-bottom: 15px;">⚠️</div>
                <h3 style="color: #e74c3c; margin-bottom: 10px;">Error</h3>
                <p style="margin-bottom: 15px;">${message}</p>
                <button class="btn btn-update" data-type="${type}" style="background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    Upload Berkas Baru
                </button>
            </div>
        `;

        // Re-attach event listener untuk tombol upload baru
        const uploadBtn = modalContent.querySelector('.btn-update');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                const newType = e.target.dataset.type;
                showUpdateForm(newType);
            });
        }
    }

    // Fungsi untuk menampilkan form update
    function showUpdateForm(type) {
        modalTitle.textContent = `Memperbarui Berkas ${type.toUpperCase()}`;
        
        modalContent.innerHTML = `
            <form id="uploadForm" class="upload-form" enctype="multipart/form-data" style="padding: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="berkasFile" style="display: block; margin-bottom: 5px; font-weight: bold;">
                        Pilih Berkas PDF Baru untuk ${type.toUpperCase()}:
                    </label>
                    <input type="file" id="berkasFile" name="berkas" accept="application/pdf" required 
                           style="width: 100%; padding: 10px; border: 2px dashed #ddd; border-radius: 5px;">
                    <small style="color: #666; font-size: 0.8em;">
                        File harus berupa PDF dengan ukuran maksimal 20MB
                    </small>
                </div>
                
                <div class="form-group" style="margin-bottom: 15px;">
                    <button type="submit" style="background: #27ae60; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                        <span class="btn-text">Unggah Berkas</span>
                        <span class="btn-loading" style="display: none;">Mengunggah...</span>
                    </button>
                </div>
                
                <div id="uploadMessage" style="margin-top: 10px; padding: 10px; border-radius: 5px; display: none;"></div>
            </form>
        `;

        // Setup form submission
        setupFormSubmission(type);
    }

    // Fungsi untuk setup form submission
    function setupFormSubmission(type) {
        const uploadForm = document.getElementById('uploadForm');
        const fileInput = document.getElementById('berkasFile');
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const uploadMessage = document.getElementById('uploadMessage');

        // Preview file info saat dipilih
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileSize = (file.size / (1024 * 1024)).toFixed(2);
                const fileInfo = document.createElement('div');
                fileInfo.innerHTML = `
                    <small style="color: #666;">
                        File dipilih: ${file.name} (${fileSize} MB)
                    </small>
                `;
                
                // Remove existing file info
                const existingInfo = uploadForm.querySelector('.file-info');
                if (existingInfo) existingInfo.remove();
                
                fileInfo.className = 'file-info';
                fileInput.parentNode.appendChild(fileInfo);
            }
        });

        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const file = fileInput.files[0];
            
            if (!file) {
                showMessage('Harap pilih file untuk diunggah.', 'error');
                return;
            }

            // Validasi ukuran file (20MB)
            if (file.size > 20 * 1024 * 1024) {
                showMessage('Ukuran file terlalu besar. Maksimal 20MB.', 'error');
                return;
            }

            // Validasi tipe file
            if (file.type !== 'application/pdf') {
                showMessage('File harus berupa PDF.', 'error');
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';

            const formData = new FormData();
            formData.append('berkas', file);

            showMessage('Mengunggah file...', 'info');

            try {
                const response = await fetch(`/check/update/${type}`, {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.text();

                if (response.ok) {
                    showMessage(`Berhasil: ${result}`, 'success');
                    
                    // Auto close modal after success
                    setTimeout(() => {
                        closeModal();
                        // Optionally reload the page to refresh status
                        // window.location.reload();
                    }, 2000);
                } else {
                    showMessage(`Gagal: ${result || 'Terjadi kesalahan'}`, 'error');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showMessage('Terjadi kesalahan jaringan atau server.', 'error');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            }
        });

        function showMessage(message, type) {
            uploadMessage.style.display = 'block';
            uploadMessage.textContent = message;
            
            // Reset classes
            uploadMessage.className = '';
            
            switch(type) {
                case 'success':
                    uploadMessage.style.backgroundColor = '#d4edda';
                    uploadMessage.style.color = '#155724';
                    uploadMessage.style.border = '1px solid #c3e6cb';
                    break;
                case 'error':
                    uploadMessage.style.backgroundColor = '#f8d7da';
                    uploadMessage.style.color = '#721c24';
                    uploadMessage.style.border = '1px solid #f5c6cb';
                    break;
                case 'info':
                    uploadMessage.style.backgroundColor = '#d1ecf1';
                    uploadMessage.style.color = '#0c5460';
                    uploadMessage.style.border = '1px solid #bee5eb';
                    break;
            }
        }
    }

    // Event listener untuk semua tombol "Melihat berkas" dan "Memperbarui"
    document.querySelectorAll('.btn-view, .btn-update').forEach(button => {
        button.addEventListener('click', (event) => {
            const type = event.target.dataset.type;
            const action = event.target.classList.contains('btn-view') ? 'view' : 'update';

            openModal();

            if (action === 'view') {
                modalTitle.textContent = `Melihat Berkas ${type.toUpperCase()}`;
                showLoading('Memuat berkas...');

                // Create iframe for PDF viewing
                const iframe = document.createElement('iframe');
                iframe.id = 'pdfViewer';
                iframe.src = `/check/view/${type}`;
                iframe.style.cssText = 'width: 100%; height: 500px; border: 1px solid #ddd; border-radius: 5px;';
                iframe.frameBorder = '0';

                // Handle iframe load events
                iframe.onload = () => {
                    modalContent.innerHTML = `
                        <div class="pdf-container">
                            <div class="pdf-toolbar" style="background: #f8f9fa; padding: 10px; border-radius: 5px 5px 0 0; border-bottom: 1px solid #ddd;">
                                <button onclick="document.getElementById('pdfViewer').src = document.getElementById('pdfViewer').src" 
                                        style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                                    🔄 Refresh
                                </button>
                                <button onclick="window.open('/check/view/${type}', '_blank')" 
                                        style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 5px;">
                                    🔗 Buka di Tab Baru
                                </button>
                            </div>
                        </div>
                    `;
                    modalContent.appendChild(iframe);
                };

                iframe.onerror = () => {
                    showError('Berkas tidak dapat dimuat. File mungkin belum diunggah atau ada masalah server.', type);
                };

                // Timeout for iframe loading
                setTimeout(() => {
                    if (modalContent.querySelector('.loading-container')) {
                        showError('Berkas tidak dapat dimuat. File mungkin belum diunggah atau ada masalah server.', type);
                    }
                }, 10000); // 10 second timeout

            } else if (action === 'update') {
                showUpdateForm(type);
            }
        });
    });

    // Optional: Check berkas status on page load and update UI
    async function checkBerkasStatus() {
        try {
            const response = await fetch('/check/status');
            if (response.ok) {
                const status = await response.json();
                
                // Update UI based on status
                Object.keys(status).forEach(type => {
                    const section = document.querySelector(`[data-type="${type}"]`)?.closest('.berkas-section');
                    if (section) {
                        const indicator = document.createElement('div');
                        indicator.className = 'status-indicator';
                        indicator.style.cssText = `
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: ${status[type] === 'uploaded' ? '#28a745' : '#dc3545'};
                        `;
                        
                        if (!section.querySelector('.status-indicator')) {
                            section.style.position = 'relative';
                            section.appendChild(indicator);
                        }
                    }
                });
            }
        } catch (error) {
            console.log('Could not check berkas status:', error);
        }
    }

    // Check status on page load
    checkBerkasStatus();
});
