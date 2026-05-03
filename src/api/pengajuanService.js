import apiClient from "./ApiClient";

const pickValue = (...values) =>
    values.find((value) => value !== undefined && value !== null);

const extractListData = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.pengajuan)) {
        return payload.pengajuan;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
    }

    if (Array.isArray(payload?.data?.pengajuan)) {
        return payload.data.pengajuan;
    }

    return [];
};

const toNumberOrNull = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizeKategori = (value, semesterValue = "", ujianValue = "") => {
    const raw = String(value ?? "").toLowerCase().trim();
    const semester = String(semesterValue ?? "").toLowerCase().trim();
    const ujian = String(ujianValue ?? "").toLowerCase().trim();

    if (raw.includes("ujian") || raw.includes("atk_ujian") || ujian) {
        return "ujian";
    }

    if (
        raw.includes("kelas") ||
        raw.includes("atk_kelas") ||
        ["ganjil", "genap"].includes(semester)
    ) {
        return "kelas";
    }

    if (raw.includes("tahunan") || raw.includes("atk_tahunan")) {
        return "tahunan";
    }

    return "tahunan";
};

const normalizeStatus = (value) => {
    const raw = String(value ?? "").toLowerCase().trim();

    if (["1", "approve", "approved", "disetujui", "selesai"].includes(raw)) {
        return "Disetujui";
    }

    if (["2", "reject", "rejected", "ditolak"].includes(raw)) {
        return "Ditolak";
    }

    return "Menunggu";
};

const normalizeSubmissionItems = (submission = {}) => {
    const itemCandidates = [
        submission.barang_pengajuan,
        submission.barangPengajuan,
        submission.detail_barang,
        submission.detailBarang,
        submission.items,
        submission.details,
        submission.barang,
        submission.barang_lainnya,
        submission.barangLainnya,
        submission.lainnya,
    ];

    const items = itemCandidates
        .filter((candidate) => Array.isArray(candidate))
        .flat();

    return items.map((item, index) => {
        const kategori = normalizeKategori(
            pickValue(
                item.kategori,
                item.jenis,
                item.tipe,
                item.barang?.kategori,
                item.barang?.jenis,
                item.barang?.tipe,
            ),
            submission.semester,
            submission.ujian,
        );

        const isLainnya = Boolean(
            pickValue(item.is_lainnya, item.isLainnya, item.manual, false),
        ) || Boolean(item.nama && !item.barang);

        return {
            id: pickValue(item.id, item.barang_pengajuan_id, `item-${index + 1}`),
            namaBarang: String(
                pickValue(
                    item.nama,
                    item.nama_barang,
                    item.namaBarang,
                    item.barang?.nama,
                    item.barang?.nama_barang,
                    "-",
                ),
            ).trim(),
            satuan: String(
                pickValue(item.satuan, item.barang?.satuan, item.unit, "-"),
            ).trim(),
            kategori,
            jumlah:
                toNumberOrNull(
                    pickValue(
                        item.jumlah,
                        item.qty,
                        item.quantity,
                        item.jumlah_diajukan,
                        item.jumlahDiajukan,
                        0,
                    ),
                ) ?? 0,
            jumlahDisetujui:
                toNumberOrNull(
                    pickValue(
                        item.jumlah_disetujui,
                        item.jumlahDisetujui,
                        item.qty_approved,
                        item.jumlah_disetujui_admin,
                        item.jumlahDisetujuiAdmin,
                        item.jumlah_disetujui_petugas,
                        item.jumlahDisetujuiPetugas,
                        item.jumlah_disetujui_kabag,
                        item.jumlahDisetujuiKabag,
                    ),
                ) ?? null,
            status: normalizeStatus(pickValue(item.status, submission.status, submission.status_pengajuan)),
            isLainnya,
        };
    });
};

const normalizeSubmission = (submission = {}) => {
    const inferAcademicYear = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        return `${year}/${year + 1}`;
    };

    const kategori = normalizeKategori(
        pickValue(
            submission.kategori,
            submission.jenis,
            submission.tipe,
            submission.tipe_pengajuan,
            submission.jenis_pengajuan,
            submission.unit_type,
        ),
        submission.semester,
        submission.ujian,
    );

    const items = normalizeSubmissionItems(submission);

    const fallbackItem = {
        id: `submission-${pickValue(submission.id, submission.pengajuan_id, Date.now())}`,
        namaBarang: String(
            pickValue(submission.keterangan, submission.catatan, `Pengajuan #${submission.id ?? "-"}`),
        ).trim(),
        satuan: "-",
        kategori,
        jumlah: 0,
        jumlahDisetujui: null,
        status: normalizeStatus(pickValue(submission.status, submission.status_pengajuan)),
        isLainnya: false,
    };

    const tahunAkademik = String(
        pickValue(
            submission.tahun_akademik,
            submission.tahunAkademik,
            submission.tahun,
            submission.tahun_ajaran,
            submission.tahunAjaran,
            "",
        ),
    ).trim();
    const tanggalSumber = pickValue(
        submission.date,
        submission.tanggal,
        submission.created_at,
        submission.createdAt,
        submission.tanggal_mulai,
        submission.tanggalMulai,
        submission.aktif_mulai,
        submission.aktifMulai,
        null,
    );
    const inferredYear = inferAcademicYear(tanggalSumber);

    return {
        id: pickValue(submission.id, submission.pengajuan_id, submission.pengajuanId),
        kategori,
        tahunAkademik: tahunAkademik || inferredYear,
        status: normalizeStatus(pickValue(submission.status, submission.status_pengajuan)),
        items: items.length > 0 ? items : [fallbackItem],
    };
};

const normalizeSubmissionList = (payload) =>
    extractListData(payload).map(normalizeSubmission).filter((item) => item.id !== undefined && item.id !== null);

export const listPengajuanSaya = async () => {
    try {
        const response = await apiClient.get("/my-pengajuan");
        return normalizeSubmissionList(response.data);
    } catch (error) {
        if (error?.response?.status !== 404) {
            throw error;
        }

        const fallbackResponse = await apiClient.get("/pengajuan");
        return normalizeSubmissionList(fallbackResponse.data);
    }
};

export const listPengajuan = async () => {
    const response = await apiClient.get("/pengajuan");
    return normalizeSubmissionList(response.data);
};

export const listHistoriPengajuan = async () => {
    const response = await apiClient.get("/histori-pengajuan");
    return normalizeSubmissionList(response.data);
};
