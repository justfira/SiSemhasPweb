document.addEventListener("DOMContentLoaded", function () {
  window.downloadPDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nama = document.querySelector(".form-info h3:nth-child(1)").textContent;
    const nim = document.querySelector(".form-info h3:nth-child(2)").textContent;
    const judul = document.querySelector(".form-info h3:nth-child(3)").textContent;
    const status = document.querySelector(".status-section .form-group:nth-child(1)").textContent;
    const komentar = document.querySelector(".status-section .form-group:nth-child(2)").textContent;
    const namaDosen = document.getElementById("printDosenSignatureName").textContent.trim();
    const nipDosen = document.getElementById("printDosenSignatureId").textContent.trim();

    doc.setFontSize(16);
    doc.text("Penilaian Seminar Akhir", 70, 15);

    doc.setFontSize(12);
    doc.text(nama, 10, 30);
    doc.text(nim, 10, 40);
    doc.text(judul, 10, 50);
    doc.text("Nama Dosen: " + namaDosen, 10, 60);
    doc.text("NIP: " + nipDosen, 10, 70);



    // Tabel Penilaian
    const rows = [];
    const tableRows = document.querySelectorAll("#nilai-body tr");
    tableRows.forEach(row => {
      const cols = row.querySelectorAll("td");
      const rowData = Array.from(cols).map(col => col.textContent.trim());
      rows.push(rowData);
    });

    doc.autoTable({
      head: [['No', 'Kriteria', 'Bobot']],
      body: rows,
      startY: 90,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(status, 10, finalY);
    doc.text(komentar, 10, finalY + 10);

    
    
    // Tambahkan tanda tangan di sisi kanan
    const date = new Date();
    const formattedDate = date.toLocaleDateString('id-ID');
    doc.text(`Padang, ${formattedDate}`, 140, finalY + 30);
    doc.text("Dosen Penguji,", 140, finalY + 40);
    doc.text(`(${namaDosen})`, 140, finalY + 70);
    doc.text(`NIP. ${nipDosen}`, 140, finalY + 80);

    doc.save('nilai-seminar.pdf');
  }

});