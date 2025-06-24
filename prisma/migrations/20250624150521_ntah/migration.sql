-- CreateTable
CREATE TABLE `admin` (
    `niku` VARCHAR(50) NOT NULL,
    `nama_admin` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `admin_email_key`(`email`),
    PRIMARY KEY (`niku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluasi_sistem` (
    `id` VARCHAR(50) NOT NULL,
    `fitur` INTEGER NOT NULL,
    `konten` INTEGER NOT NULL,
    `responsif` INTEGER NOT NULL,
    `kemudahan` INTEGER NOT NULL,
    `dokumentasi` INTEGER NOT NULL,
    `saran` VARCHAR(191) NULL,
    `kritik` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_pendaftaran` (
    `id_jadwal` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pendaftaran` INTEGER NOT NULL,
    `status` VARCHAR(50) NULL,
    `dosen_penguji` VARCHAR(99) NULL,
    `id_kuota` VARCHAR(50) NULL,
    `id_jadwal_dosen` INTEGER NULL,
    `id_user` VARCHAR(50) NULL,
    `jadwal_semhas` VARCHAR(50) NULL,
    `tanggal_semhas` DATE NULL,

    INDEX `fk_pendaftaran_jadwal_pendaftaran`(`id_pendaftaran`),
    INDEX `jadwal_pendaftaran_id_user_fkey`(`id_user`),
    INDEX `jadwal_dosen_id_jadwal_fkey`(`id_jadwal_dosen`),
    INDEX `jadwal_pendaftaran_id_kuota_idx`(`id_kuota`),
    PRIMARY KEY (`id_jadwal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kadep` (
    `nip_kadep` VARCHAR(50) NOT NULL,
    `nama_kadep` VARCHAR(99) NOT NULL,
    `email` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `kadep_email_key`(`email`),
    INDEX `kadep_email_idx`(`email`),
    PRIMARY KEY (`nip_kadep`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kuota_semhas` (
    `id_kuota` VARCHAR(50) NOT NULL,
    `kuota_max` INTEGER NOT NULL,
    `minggu` TIME(0) NOT NULL,

    PRIMARY KEY (`id_kuota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_semhas` (
    `status_semhas` VARCHAR(50) NOT NULL,
    `komentar` TEXT NOT NULL,
    `id_rubik` VARCHAR(50) NOT NULL,
    `id_pendaftaran` INTEGER NOT NULL,
    `id_user` VARCHAR(50) NOT NULL,

    INDEX `fk_pendaftaran_nilai_semhas`(`id_pendaftaran`),
    INDEX `fk_rubik_nilai_semhas`(`id_rubik`),
    INDEX `fk_dosen_nilai_semhas`(`id_user`),
    PRIMARY KEY (`id_rubik`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `panduan` (
    `id_panduan` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_file` VARCHAR(255) NOT NULL,
    `tanggal_unggah` DATE NOT NULL,
    `file` BLOB NOT NULL,
    `adminNiku` VARCHAR(50) NULL,

    INDEX `panduan_adminNiku_fkey`(`adminNiku`),
    PRIMARY KEY (`id_panduan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pendaftaran` (
    `id_pendaftaran` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(799) NULL,
    `bidang_penelitian` VARCHAR(99) NULL,
    `nama_dosen` VARCHAR(50) NULL,
    `nama_laporan` VARCHAR(255) NULL,
    `nama_krs` VARCHAR(255) NULL,
    `nama_pengesahan` VARCHAR(255) NULL,
    `nama_ppt` VARCHAR(255) NULL,
    `id_periode` VARCHAR(50) NULL,
    `id_user` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NULL,

    INDEX `fk_periode_semhas_pendaftaran`(`id_periode`),
    INDEX `pendaftaran_id_user_fkey`(`id_user`),
    PRIMARY KEY (`id_pendaftaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `periode_semhas` (
    `id_periode` VARCHAR(50) NOT NULL,
    `semester` INTEGER NOT NULL,
    `tanggal_buka` DATE NOT NULL,
    `tanggal_tutup` DATE NOT NULL,
    `status` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_periode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rubik` (
    `id_rubik` VARCHAR(50) NOT NULL,
    `pemahaman` VARCHAR(255) NOT NULL,
    `dokumenasi` VARCHAR(255) NOT NULL,
    `presentasi` VARCHAR(255) NOT NULL,
    `ketepatan_waktu` VARCHAR(255) NOT NULL,
    `sikap` VARCHAR(255) NOT NULL,
    `id_pendaftaran` INTEGER NOT NULL,

    INDEX `fk_pendaftaran_rubik`(`id_pendaftaran`),
    PRIMARY KEY (`id_rubik`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `password` VARCHAR(99) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `id_user` VARCHAR(50) NULL,
    `nama_lengkap` VARCHAR(99) NOT NULL,

    UNIQUE INDEX `id_user`(`id_user`),
    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_dosendosen` (
    `id_jadwal_dosen` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal_data` DATE NOT NULL,
    `bidang_keahlian` VARCHAR(191) NULL,
    `shift1` VARCHAR(191) NULL,
    `shift2` VARCHAR(191) NULL,
    `shift3` VARCHAR(191) NULL,
    `shift4` VARCHAR(191) NULL,
    `id_user` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `jadwal_dosenDosen_tanggal_data_key`(`tanggal_data`),
    INDEX `jadwal_dosendosen_id_user_fkey`(`id_user`),
    PRIMARY KEY (`id_jadwal_dosen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jadwal_pendaftaran` ADD CONSTRAINT `jadwal_pendaftaran_id_kuota_fkey` FOREIGN KEY (`id_kuota`) REFERENCES `kuota_semhas`(`id_kuota`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_pendaftaran` ADD CONSTRAINT `fk_pendaftaran_jadwal_pendaftaran` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran`(`id_pendaftaran`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `jadwal_pendaftaran` ADD CONSTRAINT `jadwal_dosen_id_jadwal_fkey` FOREIGN KEY (`id_jadwal_dosen`) REFERENCES `jadwal_dosendosen`(`id_jadwal_dosen`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `jadwal_pendaftaran` ADD CONSTRAINT `jadwal_pendaftaran_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kadep` ADD CONSTRAINT `fk_user_kadep` FOREIGN KEY (`email`) REFERENCES `user`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_semhas` ADD CONSTRAINT `fk_dosen_nilai_semhas` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `nilai_semhas` ADD CONSTRAINT `fk_pendaftaran_nilai_semhas` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran`(`id_pendaftaran`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `nilai_semhas` ADD CONSTRAINT `fk_rubik_nilai_semhas` FOREIGN KEY (`id_rubik`) REFERENCES `rubik`(`id_rubik`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `panduan` ADD CONSTRAINT `panduan_adminNiku_fkey` FOREIGN KEY (`adminNiku`) REFERENCES `admin`(`niku`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_id_periode_fkey` FOREIGN KEY (`id_periode`) REFERENCES `periode_semhas`(`id_periode`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_dosendosen` ADD CONSTRAINT `jadwal_dosendosen_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
