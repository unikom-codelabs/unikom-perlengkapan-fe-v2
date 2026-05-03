import apiClient from "./ApiClient";

const AKTIVASI_KATEGORI = ["tahunan", "ujian", "kelas"];

const pickValue = (...values) =>
    values.find((value) => value !== undefined && value !== null);

const toNullableNumber = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizeBoolean = (value) => {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value === 1;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (["1", "true", "aktif", "active", "ya", "yes", "on"].includes(normalized)) {
            return true;
        }

        if (["0", "false", "nonaktif", "non-aktif", "inactive", "tidak", "no", "off"].includes(normalized)) {
            return false;
        }
    }

    return false;
};

const normalizeDateValue = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === "number") {
        const timestamp = value > 9999999999 ? value : value * 1000;
        return new Date(timestamp).toISOString();
    }

    if (typeof value === "string" && /^\d{10,13}$/.test(value.trim())) {
        const numericValue = Number(value.trim());
        const timestamp = value.trim().length === 13 ? numericValue : numericValue * 1000;
        return new Date(timestamp).toISOString();
    }

    if (typeof value === "object") {
        return pickValue(value.date, value.datetime, value.timestamp, null);
    }

    return value;
};

const normalizeTipe = (value) => {
    const normalized = String(value ?? "").trim().toLowerCase();

    if (!normalized) {
        return "rutin";
    }

    if (["nonrutin", "non_rutin", "non-rutin", "non rutin", "lainnya"].includes(normalized)) {
        return "nonrutin";
    }

    return "rutin";
};

const toTipeLabel = (tipeValue) => {
    const tipe = normalizeTipe(tipeValue);
    return tipe === "nonrutin" ? "Non Rutin" : "Rutin";
};

const normalizeKategoriValue = (value) => {
    const normalized = String(value ?? "").toLowerCase().trim();

    if (!normalized) {
        return "";
    }

    if (normalized.includes("ujian")) {
        return "ujian";
    }

    if (normalized.includes("kelas")) {
        return "kelas";
    }

    if (normalized.includes("tahunan")) {
        return "tahunan";
    }

    if (["nonrutin", "non_rutin", "non-rutin", "non rutin"].includes(normalized)) {
        return "nonrutin";
    }

    return "";
};

const normalizeSemester = (value) => {
    const normalized = String(value ?? "").trim().toLowerCase();

    if (!normalized) {
        return "";
    }

    if (["ganjil", "odd", "1"].includes(normalized)) {
        return "ganjil";
    }

    if (["genap", "even", "2"].includes(normalized)) {
        return "genap";
    }

    return normalized;
};

const normalizeUjian = (value) => {
    const normalized = String(value ?? "").trim().toLowerCase();

    if (!normalized || normalized === "default") {
        return "";
    }

    if (["uts", "mid", "midterm", "tengah semester"].includes(normalized)) {
        return "uts";
    }

    if (["uas", "final", "akhir semester"].includes(normalized)) {
        return "uas";
    }

    return normalized;
};

const inferKategoriFromPeriodFields = (item = {}) => {
    const pengajuanItem =
        item?.pengajuan && typeof item.pengajuan === "object"
            ? item.pengajuan
            : {};
    const semester = normalizeSemester(
        pickValue(
            item.semester,
            item.semester_pengajuan,
            item.semesterPengajuan,
            pengajuanItem.semester,
            pengajuanItem.semester_pengajuan,
            pengajuanItem.semesterPengajuan,
            "",
        ),
    );
    const ujian = normalizeUjian(
        pickValue(
            item.ujian,
            item.jenis_ujian,
            item.jenisUjian,
            pengajuanItem.ujian,
            pengajuanItem.jenis_ujian,
            pengajuanItem.jenisUjian,
            "",
        ),
    );

    if (ujian) {
        return "ujian";
    }

    if (semester === "tahunan") {
        return "tahunan";
    }

    if (["ganjil", "genap"].includes(semester)) {
        return "kelas";
    }

    return "";
};

const resolveKategori = (item = {}) => {
    const pengajuanItem =
        item?.pengajuan && typeof item.pengajuan === "object"
            ? item.pengajuan
            : {};

    const categoryLikeValue = pickValue(
        pengajuanItem.tipe,
        pengajuanItem.jenis,
        pengajuanItem.kategori,
        pengajuanItem.jenis_pengajuan,
        pengajuanItem.tipe_pengajuan,
        item.kategori,
        item.jenis,
        item.tipe,
        item.jenis_pengajuan,
        item.tipe_pengajuan,
        item.unit_type,
        item.unitType,
        item.category,
        item.nama_jenis,
        item.namaJenis,
    );

    const kategoriFromFields = normalizeKategoriValue(categoryLikeValue);
    if (kategoriFromFields) {
        return kategoriFromFields;
    }

    const namaPeriode = pickValue(item.nama_periode, item.namaPeriode, item.nama, item.title, "");
    const kategoriFromName = normalizeKategoriValue(namaPeriode);

    if (kategoriFromName) {
        return kategoriFromName;
    }

    return "";
};

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

    if (Array.isArray(payload?.periode)) {
        return payload.periode;
    }

    if (Array.isArray(payload?.aktivasi_pengajuan)) {
        return payload.aktivasi_pengajuan;
    }

    if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
    }

    if (Array.isArray(payload?.data?.periode)) {
        return payload.data.periode;
    }

    if (Array.isArray(payload?.data?.aktivasi_pengajuan)) {
        return payload.data.aktivasi_pengajuan;
    }

    if (Array.isArray(payload?.data?.pengajuan)) {
        return payload.data.pengajuan;
    }

    return [];
};

const extractItemData = (payload) => {
    if (payload?.data?.data && typeof payload.data.data === "object") {
        return payload.data.data;
    }

    if (payload?.data?.periode && typeof payload.data.periode === "object") {
        return payload.data.periode;
    }

    if (payload?.data?.aktivasi_pengajuan && typeof payload.data.aktivasi_pengajuan === "object") {
        return payload.data.aktivasi_pengajuan;
    }

    if (payload?.data && typeof payload.data === "object") {
        return payload.data;
    }

    if (payload && typeof payload === "object") {
        return payload;
    }

    return {};
};

const normalizeAktivasiPengajuan = (item = {}, fallbackKategori = "") => {
    const pengajuanItem =
        item?.pengajuan && typeof item.pengajuan === "object"
            ? item.pengajuan
            : {};

    const id = toNullableNumber(
        pickValue(
            item.id,
            item.aktivasi_pengajuan_id,
            item.aktivasiPengajuanId,
            item.id_pengajuan,
            item.idPengajuan,
        ),
    );
    const aktifMulai = normalizeDateValue(
        pickValue(
            item.aktif_mulai,
            item.aktifMulai,
            item.tanggal_mulai,
            item.tanggalMulai,
            item.start_date,
            item.startDate,
            null,
        ),
    );
    const aktifSelesai = normalizeDateValue(
        pickValue(
            item.aktif_selesai,
            item.aktifSelesai,
            item.tanggal_selesai,
            item.tanggalSelesai,
            item.end_date,
            item.endDate,
            null,
        ),
    );

    const tipe = normalizeTipe(
        pickValue(
            item.tipe,
            item.jenis,
            item.tipe_pengajuan,
            item.tipePengajuan,
            pengajuanItem.tipe,
            pengajuanItem.jenis,
            pengajuanItem.tipe_pengajuan,
            pengajuanItem.tipePengajuan,
            "rutin",
        ),
    );
    const kategori =
        resolveKategori(item) ||
        inferKategoriFromPeriodFields(item) ||
        normalizeKategoriValue(fallbackKategori) ||
        (tipe === "rutin" ? "tahunan" : "nonrutin");

    return {
        id,
        idPengajuan: toNullableNumber(
            pickValue(
                item.id_pengajuan,
                item.idPengajuan,
                item.pengajuan_id,
                item.pengajuanId,
                pengajuanItem.id,
                pengajuanItem.id_pengajuan,
                pengajuanItem.idPengajuan,
                id,
            ),
        ),
        namaPeriode: String(
            pickValue(item.nama_periode, item.namaPeriode, item.nama, item.title, ""),
        ).trim(),
        aktifMulai,
        aktifSelesai,
        tanggalMulai: aktifMulai,
        tanggalSelesai: aktifSelesai,
        tipe,
        tahunAkademik: String(
            pickValue(item.tahun_akademik, item.tahunAkademik, item.tahun, ""),
        ).trim(),
        statusAktif: normalizeBoolean(
            pickValue(item.status_aktif, item.statusAktif, item.aktif, item.is_active, item.isActive, item.status),
        ),
        kategori,
    };
};

const normalizeAktivasiList = (payload, fallbackKategori = "") => {
    const list = extractListData(payload);

    if (list.length > 0) {
        return list.map((item) => normalizeAktivasiPengajuan(item, fallbackKategori));
    }

    const item = extractItemData(payload);

    if (item && Object.keys(item).length > 0) {
        return [normalizeAktivasiPengajuan(item, fallbackKategori)];
    }

    return [];
};

const fetchAktivasiByKategori = async (kategori) => {
    const response = await apiClient.get("/aktivasi-pengajuan", {
        params: { tipe: kategori },
    });

    return normalizeAktivasiList(response.data, kategori);
};

const fetchCurrentAktivasiByKategori = async (kategori) => {
    const fallbackEndpoints = ["/periode-aktif", "/aktivasi-pengajuan-current"];

    for (const endpoint of fallbackEndpoints) {
        try {
            const response = await apiClient.get(endpoint, {
                params: { tipe: kategori },
            });

            const normalized = normalizeAktivasiList(response.data, kategori);
            if (normalized.length > 0) {
                return normalized;
            }
        } catch (error) {
            if (error?.response?.status === 404) {
                continue;
            }
        }
    }

    return [];
};

const enrichAktivasiKategoriFromPengajuan = async (aktivasiList = []) => {
    const missingKategoriPengajuanIds = [
        ...new Set(
            aktivasiList
                .filter((item) => !item.kategori && item.idPengajuan !== null)
                .map((item) => item.idPengajuan),
        ),
    ];

    if (missingKategoriPengajuanIds.length === 0) {
        return aktivasiList;
    }

    try {
        const response = await apiClient.get("/pengajuan");
        const pengajuanById = new Map(
            extractListData(response.data)
                .map(normalizePengajuan)
                .filter((item) => item.id !== null && item.kategori)
                .map((item) => [item.id, item.kategori]),
        );

        return aktivasiList.map((item) => {
            if (item.kategori || item.idPengajuan === null) {
                return item;
            }

            return {
                ...item,
                kategori: pengajuanById.get(item.idPengajuan) || item.kategori,
            };
        });
    } catch (error) {
        return aktivasiList;
    }
};

const buildActivatePayload = (payload = {}) => {
    const idPengajuan = toNullableNumber(
        pickValue(payload.id_pengajuan, payload.idPengajuan, payload.id),
    );
    const aktifMulai = String(
        pickValue(payload.aktif_mulai, payload.aktifMulai, payload.tanggal_mulai, payload.tanggalMulai, ""),
    ).trim();
    const aktifSelesai = String(
        pickValue(
            payload.aktif_selesai,
            payload.aktifSelesai,
            payload.tanggal_selesai,
            payload.tanggalSelesai,
            "",
        ),
    ).trim();
    const tipe = normalizeTipe(pickValue(payload.tipe, payload.jenis, "rutin"));
    const tahunAkademik = String(
        pickValue(payload.tahun_akademik, payload.tahunAkademik, payload.tahun, ""),
    ).trim();
    const semester = normalizeSemester(
        pickValue(payload.semester, payload.semester_pengajuan, payload.semesterPengajuan, ""),
    );
    const isValidSemester = ["ganjil", "genap"].includes(semester);

    const body = {
        tipe,
    };

    if (idPengajuan !== null) {
        body.id_pengajuan = idPengajuan;
    }

    if (aktifMulai) {
        body.aktif_mulai = aktifMulai;
    }

    if (aktifSelesai) {
        body.aktif_selesai = aktifSelesai;
    }

    if (tahunAkademik) {
        body.tahun_akademik = tahunAkademik;
    }

    if (isValidSemester) {
        body.semester = semester;
    }

    return body;
};

const buildPeriodePayload = (payload = {}) => {
    const activatePayload = buildActivatePayload(payload);
    const tanggalMulai = activatePayload.aktif_mulai ?? "";
    const tanggalSelesai = activatePayload.aktif_selesai ?? "";
    const tahunAkademik = activatePayload.tahun_akademik ?? "";
    const tipe = activatePayload.tipe ?? "rutin";
    const namaPeriodeInput = String(
        pickValue(payload.nama_periode, payload.namaPeriode, payload.nama, payload.title, ""),
    ).trim();

    const namaPeriode =
        namaPeriodeInput ||
        [
            "Periode",
            toTipeLabel(tipe),
            tahunAkademik,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

    return {
        nama_periode: namaPeriode,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        ...activatePayload,
    };
};

const normalizePengajuan = (item = {}) => {
    const id = toNullableNumber(
        pickValue(item.id, item.pengajuan_id, item.pengajuanId, item.id_pengajuan, item.idPengajuan),
    );
    const aktivasiId = toNullableNumber(
        pickValue(
            item.id_aktivasi,
            item.idAktivasi,
            item.aktivasi_pengajuan_id,
            item.aktivasiPengajuanId,
            item.id_aktivasi_pengajuan,
            item.idAktivasiPengajuan,
        ),
    );
    const tipe = normalizeTipe(
        pickValue(item.tipe_pengajuan, item.tipePengajuan, item.jenis_pengajuan, item.jenisPengajuan, "rutin"),
    );
    const tahunAkademik = String(
        pickValue(item.tahun_akademik, item.tahunAkademik, item.tahun, ""),
    ).trim();
    const semester = normalizeSemester(
        pickValue(item.semester, item.semester_pengajuan, item.semesterPengajuan, ""),
    );
    const tanggalPengajuan = normalizeDateValue(
        pickValue(item.created_at, item.createdAt, item.tanggal, item.date, null),
    );
    const ujian = normalizeUjian(
        pickValue(item.ujian, item.jenis_ujian, item.jenisUjian, ""),
    );
    const kategori =
        normalizeKategoriValue(
            pickValue(item.kategori, item.tipe, item.jenis, item.jenis_pengajuan, item.tipe_pengajuan),
        ) || resolveKategori(item);

    return {
        id,
        aktivasiId,
        tipe,
        tahunAkademik,
        semester,
        ujian,
        tanggalPengajuan,
        kategori,
    };
};

export const listPengajuanBelumAktivasi = async () => {
    const response = await apiClient.get("/pengajuan");

    return extractListData(response.data)
        .map(normalizePengajuan)
        .filter((item) => item.id !== null && item.aktivasiId === null);
};

export const listAktivasiPengajuan = async () => {
    const byKategoriSettled = await Promise.allSettled(
        AKTIVASI_KATEGORI.map((kategori) => fetchAktivasiByKategori(kategori)),
    );

    const byKategori = byKategoriSettled.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
    );

    if (byKategori.length > 0) {
        const kategoriTersedia = new Set(byKategori.map((item) => item.kategori).filter(Boolean));
        const kategoriBelumAda = AKTIVASI_KATEGORI.filter(
            (kategori) => !kategoriTersedia.has(kategori),
        );

        if (kategoriBelumAda.length === 0) {
            return enrichAktivasiKategoriFromPengajuan(byKategori);
        }

        const currentSettled = await Promise.allSettled(
            kategoriBelumAda.map((kategori) => fetchCurrentAktivasiByKategori(kategori)),
        );

        const fromCurrent = currentSettled.flatMap((result) =>
            result.status === "fulfilled" ? result.value : [],
        );

        return enrichAktivasiKategoriFromPengajuan([...byKategori, ...fromCurrent]);
    }

    const response = await apiClient.get("/aktivasi-pengajuan");
    return enrichAktivasiKategoriFromPengajuan(normalizeAktivasiList(response.data));
};

export const createAktivasiPengajuan = async (payload = {}) => {
    const body = buildPeriodePayload(payload);
    const response = await apiClient.post("/aktivasi-pengajuan", body);
    return normalizeAktivasiPengajuan(extractItemData(response.data));
};

export const updateAktivasiPengajuan = async (id, payload = {}) => {
    const response = await apiClient.put(
        `/aktivasi-pengajuan/${id}`,
        buildPeriodePayload(payload),
    );
    return normalizeAktivasiPengajuan(extractItemData(response.data));
};

export const deleteAktivasiPengajuan = async (id) => {
    const response = await apiClient.delete(`/aktivasi-pengajuan/${id}`);
    return response.data;
};

export const activateAktivasiPengajuan = async (id, payload = {}) => {
    const response = await apiClient.patch(
        `/aktivasi-pengajuan/${id}/activate`,
        buildActivatePayload(payload),
    );
    return normalizeAktivasiPengajuan(extractItemData(response.data));
};
