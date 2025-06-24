        const pendaftaranRouter = require('../../../routes/mahasiswa/pendaftaran');
        app.use('/pendaftaran', pendaftaranRouter);
        
        // Seminar item click handlers
        document.querySelectorAll('.seminar-item').forEach(item => {
            item.addEventListener('click', function() {
                alert('Membuka detail seminar...');
            });
        });

        // Button click handlers
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                alert(`Membuka ${this.textContent}...`);
            });
        });