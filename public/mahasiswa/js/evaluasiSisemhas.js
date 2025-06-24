// Script untuk menangani form evaluasi sistem
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form'); // Sesuaikan dengan selector form Anda
    const submitButton = document.querySelector('button[type="submit"]');
    

    // Fungsi untuk mengumpulkan data form (NIM dihilangkan dari sini)
    function getFormData() {
        const formData = {
            fitur: document.querySelector('input[name="q1"]:checked')?.value,
            konten: document.querySelector('input[name="q2"]:checked')?.value,
            responsif: document.querySelector('input[name="q3"]:checked')?.value,
            kemudahan: document.querySelector('input[name="q4"]:checked')?.value,
            dokumentasi: document.querySelector('input[name="q5"]:checked')?.value,
            kritik: document.querySelector('textarea[name="kritik"]')?.value || '',
            saran: document.querySelector('textarea[name="saran"]')?.value || ''
        };
        
        return formData;
    }

    // Fungsi validasi form (tetap sama, karena masih memvalidasi q1-q5 dari input HTML)
    function validateForm(data) {
        const errors = [];
        
        if (!data.fitur) errors.push('Silakan pilih rating untuk pertanyaan 1'); // Perbarui pengecekan properti
        if (!data.konten) errors.push('Silakan pilih rating untuk pertanyaan 2');
        if (!data.responsif) errors.push('Silakan pilih rating untuk pertanyaan 3');
        if (!data.kemudahan) errors.push('Silakan pilih rating untuk pertanyaan 4');
        if (!data.dokumentasi) errors.push('Silakan pilih rating untuk pertanyaan 5');
        
        return errors;
    }

    // Fungsi untuk menampilkan loading state (tetap sama)
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Menyimpan...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    }

    // Fungsi untuk menampilkan pesan (tetap sama)
    function showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-weight: bold;
            ${type === 'success' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
            ${type === 'error' ? 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : ''}
            ${type === 'info' ? 'background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;' : ''}
        `;
        messageDiv.textContent = message;
        
        form.parentNode.insertBefore(messageDiv, form);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Event listener untuk submit form
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = getFormData();
            const errors = validateForm(formData);
            const token = localStorage.getItem('jwt_token'); 
            
            if (errors.length > 0) {
                showMessage(errors.join('\n'), 'error');
                return;
            }
            
            setLoadingState(true);
            
            try {
                // URL masih '/evaluasi' sesuai log POST sebelumnya
                const token = localStorage.getItem('jwt_token'); // Ambil token dari localStorage (sudah disimpan saat login)
                    const response = await fetch('/evaluasi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` // Kirim token ke server agar bisa di-autentikasi
                        },
                        body: JSON.stringify(formData)
                    });

                
                let results;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    const textError = await response.text();
                    console.error('JSON Parse Error:', jsonError);
                    console.error('Raw Server Response (not JSON):', textError);
                    showMessage('Terjadi kesalahan data dari server. Mohon coba lagi.', 'error');
                    setLoadingState(false);
                    return;
                }

                if (response.ok) {
                    showMessage('Evaluasi sistem berhasil disimpan. Terima kasih atas feedback Anda!', 'success');
                    form.reset();
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 2000);
                } else {
                    showMessage(result.message || 'Terjadi kesalahan saat menyimpan evaluasi', 'error');
                }
                
            } catch (error) {
                console.error('Network Error or Other Fetch Issue:', error);
                showMessage('Terjadi kesalahan koneksi. Silakan coba lagi.', 'error');
            } finally {
                setLoadingState(false);
            }
        });
    }
});