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

const normalizeKnownKategori = (value, semesterValue = "", ujianValue = "") => {
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

    return "";
};

const normalizeKategori = (value, semesterValue = "", ujianValue = "", fallback = "tahunan") =>
    normalizeKnownKategori(value, semesterValue, ujianValue) || fallback || "tahunan";

const normalizeKategoriBarang = (value) => {
    const raw = String(value ?? "").toLowerCase().trim();

    if (["habis_pakai", "habis pakai", "habis-pakai"].includes(raw)) {
        return "habis_pakai";
    }

    if (["tidak_habis_pakai", "tidak habis pakai", "tidak-habis-pakai"].includes(raw)) {
        return "tidak_habis_pakai";
    }

    return "";
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

const normalizeSubmissionItems = (submission = {}, submissionKategori = "tahunan") => {
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
        const rawKategori = pickValue(
            item.kategori,
            item.jenis,
            item.tipe,
            item.barang?.kategori,
            item.barang?.jenis,
            item.barang?.tipe,
        );
        const kategori = normalizeKategori(
            rawKategori,
            submission.semester,
            submission.ujian,
            submissionKategori,
        );
        const kategoriBarang = normalizeKategoriBarang(
            pickValue(item.kategori_barang, item.kategoriBarang, rawKategori),
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
            kategoriBarang,
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
    const aktivasi =
        [submission.aktivasi, submission.aktivasi_pengajuan, submission.aktivasiPengajuan]
            .find((item) => item && typeof item === "object") || {};

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
            aktivasi.kategori,
            aktivasi.jenis_pengajuan,
            aktivasi.tipe_pengajuan,
            aktivasi.tipe,
            aktivasi.nama_periode,
            aktivasi.nama,
        ),
        submission.semester,
        submission.ujian,
    );

    const items = normalizeSubmissionItems(submission, kategori);

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

const normalizeAdminTipe = (value) => {
    const normalized = String(value ?? "").trim().toLowerCase().replace(/[_\s-]+/g, "");

    return normalized === "nonrutin" ? "nonrutin" : "rutin";
};

const normalizeAdminStatusValue = (value) => {
    if (value === true) {
        return 1;
    }

    if (value === false) {
        return 2;
    }

    const numericValue = Number(value);
    if ([0, 1, 2].includes(numericValue)) {
        return numericValue;
    }

    return 0;
};

const normalizeAdminUser = (user, submission = {}) => {
    if (user && typeof user === "object") {
        return {
            nama: String(pickValue(user.nama, user.name, user.user, "-")).trim(),
            jabatan: String(pickValue(user.jabatan, user.jabatan_nama, user.position?.nama, "")).trim(),
            unit: String(pickValue(user.unit, user.unit_nama, user.bagian, user.divisi, user.unit?.nama, "")).trim(),
            nip: String(
                pickValue(
                    user.nip,
                    user.no_induk,
                    user.nomor_induk,
                    user.nomorInduk,
                    user.profile?.nip,
                    user.detail?.nip,
                    user.pegawai?.nip,
                    submission.nip,
                    submission.user_nip,
                    submission.nip_pengaju,
                    "",
                ),
            ).trim(),
        };
    }

    return {
        nama: String(user ?? "-").trim(),
        jabatan: "",
        unit: "",
        nip: String(
            pickValue(
                submission.nip,
                submission.user_nip,
                submission.nip_pengaju,
                "",
            ),
        ).trim(),
    };
};

const normalizeBarangMaster = (item = {}) => ({
    id: pickValue(item.id, item.barang_id),
    kategori: normalizeKategori(pickValue(item.kategori, item.jenis, item.tipe, item.category, "")),
    satuan: String(pickValue(item.satuan, item.unit, "-")).trim(),
});

const extractBarangMasterMap = (payload) => {
    const map = new Map();

    extractListData(payload).map(normalizeBarangMaster).forEach((item) => {
        if (item.id !== undefined && item.id !== null) {
            map.set(String(item.id), item);
        }
    });

    return map;
};

const inferAdminSubmissionKategori = (submission = {}, barangMasterById = new Map(), fallbackKategori = "tahunan") => {
    const barangItems = Array.isArray(submission.barang) ? submission.barang : [];
    const kategoriSet = new Set(
        barangItems
            .map((item) => {
                const master = barangMasterById.get(String(item.id_barang ?? item.idBarang ?? item.barang_id ?? ""));
                return normalizeKnownKategori(pickValue(item.kategori, master?.kategori));
            })
            .filter(Boolean),
    );

    if (kategoriSet.size === 1) {
        return [...kategoriSet][0];
    }

    return fallbackKategori;
};

const getAdminAktivasiKey = (submission = {}, tipe = "rutin") => {
    const aktivasi = submission.aktivasi || {};

    return String(
        pickValue(
            aktivasi.id,
            submission.aktivasi_pengajuan_id,
            submission.aktivasiPengajuanId,
            submission.id_aktivasi_pengajuan,
            submission.idAktivasiPengajuan,
            submission.aktivasi_pengajuan,
            submission.aktivasiPengajuan,
            tipe,
        ),
    ).trim();
};

const inferAcademicYearFromDate = (dateValue) => {
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

const inferYearFromDate = (dateValue) => {
    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return String(date.getFullYear());
};

const extractAnnualYearLabel = (value) => {
    const text = String(value ?? "").trim();
    return text.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "";
};

const extractYearLabel = (value) => {
    const text = String(value ?? "").trim();

    if (!text) {
        return "";
    }

    const academicYearMatch = text.match(/\b((?:19|20)\d{2})\s*[/-]\s*((?:19|20)\d{2})\b/);
    if (academicYearMatch) {
        return `${academicYearMatch[1]}/${academicYearMatch[2]}`;
    }

    return text.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "";
};

const getAdminAktivasiLabel = (submission = {}, tipe = "rutin", kategori = "") => {
    const aktivasi = submission.aktivasi || {};
    const isTahunan = kategori === "tahunan";
    const namaPeriode = String(
        pickValue(
            aktivasi.nama_periode,
            aktivasi.namaPeriode,
            aktivasi.nama,
            aktivasi.title,
            submission.nama_periode,
            submission.namaPeriode,
            "",
        ),
    ).trim();
    const tahunAkademik = String(
        pickValue(
            aktivasi.tahun_akademik,
            aktivasi.tahunAkademik,
            aktivasi.tahun_ajaran,
            aktivasi.tahunAjaran,
            aktivasi.tahun_periode,
            aktivasi.tahunPeriode,
            aktivasi.tahun,
            submission.tahun_akademik,
            submission.tahunAkademik,
            submission.tahun_ajaran,
            submission.tahunAjaran,
            submission.tahun_periode,
            submission.tahunPeriode,
            submission.tahun,
            "",
        ),
    ).trim();
    const dateSource = pickValue(
        aktivasi.tanggal_mulai,
        aktivasi.tanggalMulai,
        aktivasi.aktif_mulai,
        aktivasi.aktifMulai,
        aktivasi.start_date,
        aktivasi.startDate,
        submission.tanggal_mulai,
        submission.tanggalMulai,
        submission.aktif_mulai,
        submission.aktifMulai,
        submission.date,
        submission.tanggal,
        submission.created_at,
        submission.createdAt,
        null,
    );
    const inferredYear = isTahunan
        ? extractAnnualYearLabel(tahunAkademik) ||
            extractAnnualYearLabel(namaPeriode) ||
            inferYearFromDate(dateSource)
        : tahunAkademik ||
            extractYearLabel(namaPeriode) ||
            inferAcademicYearFromDate(dateSource);
    const tipeLabel = tipe === "nonrutin" ? "Non Rutin" : "Rutin";

    return inferredYear ? `${inferredYear} - ${tipeLabel}` : tipeLabel;
};

const normalizeAdminSubmission = (submission = {}, barangMasterById = new Map()) => {
    const user = normalizeAdminUser(submission.user, submission);
    const tipe = normalizeAdminTipe(
        pickValue(
            submission.aktivasi_pengajuan,
            submission.aktivasiPengajuan,
            submission.tipe,
            submission.tipe_pengajuan,
            submission.aktivasi?.tipe,
        ),
    );
    const aktivasi = submission.aktivasi || {};
    const explicitKategori = normalizeKnownKategori(
        pickValue(
            submission.kategori,
            submission.jenis_pengajuan,
            submission.tipe_pengajuan,
            aktivasi.jenis_pengajuan,
            aktivasi.kategori,
            "",
        ),
        submission.semester ?? aktivasi.semester,
        submission.ujian ?? aktivasi.ujian,
    );
    const kategori = inferAdminSubmissionKategori(
        submission,
        barangMasterById,
        explicitKategori || "tahunan",
    );
    const aktivasiKey = getAdminAktivasiKey(submission, tipe);
    const aktivasiLabel = getAdminAktivasiLabel(submission, tipe, kategori);

    const barang = (Array.isArray(submission.barang) ? submission.barang : []).map((item, index) => {
        const master = barangMasterById.get(String(item.id_barang ?? item.idBarang ?? item.barang_id ?? ""));

        return {
            id: `barang-${submission.id}-${item.id ?? index}`,
            submissionId: submission.id,
            itemId: item.id,
            endpointType: "barang",
            user: user.nama,
            userUnit: user.unit,
            userJabatan: user.jabatan,
            userNip: user.nip,
            suratPengajuan: submission.surat_pengajuan,
            tanggal: pickValue(submission.date, submission.tanggal, submission.created_at, ""),
            aktivasiKey,
            aktivasiLabel,
            tipe,
            kategori: normalizeKategori(
                pickValue(item.kategori, master?.kategori, submission.kategori, kategori),
                submission.semester,
                submission.ujian,
                kategori,
            ),
            namaBarang: String(pickValue(item.nama_barang, item.namaBarang, item.nama, "-")).trim(),
            satuan: String(pickValue(item.satuan, item.unit, item.barang?.satuan, master?.satuan, "-")).trim(),
            jumlah: toNumberOrNull(pickValue(item.jumlah_diajukan, item.jumlah, item.qty, 0)) ?? 0,
            jumlahDisetujui: toNumberOrNull(pickValue(item.jumlah_disetujui, item.jumlahDisetujui, 0)) ?? 0,
            status: normalizeAdminStatusValue(item.status),
            isLainnya: false,
        };
    });

    const barangLainnya = (Array.isArray(submission.barang_lainnya) ? submission.barang_lainnya : []).map((item, index) => ({
        kategoriBarang: normalizeKategoriBarang(pickValue(item.kategori_barang, item.kategoriBarang, item.kategori)),
        id: `lainnya-${submission.id}-${item.id ?? index}`,
        submissionId: submission.id,
        itemId: item.id,
        endpointType: "lainnya",
        user: user.nama,
        userUnit: user.unit,
        userJabatan: user.jabatan,
        userNip: user.nip,
        suratPengajuan: submission.surat_pengajuan,
        tanggal: pickValue(submission.date, submission.tanggal, submission.created_at, ""),
        aktivasiKey,
        aktivasiLabel,
        tipe,
        kategori: normalizeKategori(
            pickValue(submission.kategori, item.tipe, item.jenis, kategori),
            submission.semester,
            submission.ujian,
            kategori,
        ),
        namaBarang: String(pickValue(item.nama_barang, item.namaBarang, item.nama, "-")).trim(),
        satuan: String(pickValue(item.satuan, item.unit, "-")).trim(),
        jumlah: toNumberOrNull(pickValue(item.jumlah_diajukan, item.jumlah, item.qty, 0)) ?? 0,
        jumlahDisetujui: toNumberOrNull(pickValue(item.jumlah_disetujui, item.jumlahDisetujui, 0)) ?? 0,
        status: normalizeAdminStatusValue(item.status),
        isLainnya: true,
    }));

    return [...barang, ...barangLainnya];
};

const normalizeAdminSubmissionRows = (payload, barangMasterById = new Map()) =>
    extractListData(payload).flatMap((submission) => normalizeAdminSubmission(submission, barangMasterById));

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

export const listDaftarPengajuanAdmin = async (params = {}) => {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
    );
    const [response, barangResponse] = await Promise.all([
        apiClient.get("/admin/daftar-pengajuan", {
            params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
        }),
        apiClient.get("/barang").catch(() => null),
    ]);
    const barangMasterById = barangResponse
        ? extractBarangMasterMap(barangResponse.data)
        : new Map();

    return normalizeAdminSubmissionRows(response.data, barangMasterById);
};

export const approveBarangPengajuanAdmin = async ({
    id,
    isLainnya = false,
    jumlahDisetujui = 0,
    status = 0,
} = {}) => {
    const endpoint = isLainnya
        ? `/admin/barang-pengajuan-lainnya/${id}/approve`
        : `/admin/barang-pengajuan/${id}/approve`;
    const payload = {
        jumlah_disetujui: Number(jumlahDisetujui) || 0,
        status: Number(status) || 0,
    };

    try {
        const response = await apiClient.patch(endpoint, payload);
        return response.data?.data ?? response.data;
    } catch (error) {
        if (![404, 405].includes(error?.response?.status)) {
            throw error;
        }

        const response = await apiClient.post(endpoint, payload);
        return response.data?.data ?? response.data;
    }
};

export const listHistoriPengajuan = async () => {
    const response = await apiClient.get("/histori-pengajuan");
    return normalizeSubmissionList(response.data);
};
