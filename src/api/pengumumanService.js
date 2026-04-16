import apiClient from "./ApiClient";

const API_ORIGIN = new URL(apiClient.defaults.baseURL).origin;

const pickValue = (...values) =>
    values.find((value) => value !== undefined && value !== null);

const pickNonEmptyValue = (...values) =>
    values.find((value) => {
        if (value === undefined || value === null) {
            return false;
        }

        if (typeof value === "string") {
            return value.trim().length > 0;
        }

        return true;
    });

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

const findDateLikeValue = (item = {}) => {
    if (!item || typeof item !== "object") {
        return null;
    }

    const includePattern = /(created?_at|create_at|createdat|createat|tanggal(_buat|_dibuat)?|date|datetime|published_at|publish_at|waktu|time)/i;
    const excludePattern = /(created_by|updated_by|approved_by|user_id)$/i;

    for (const [key, value] of Object.entries(item)) {
        if (!includePattern.test(key) || excludePattern.test(key)) {
            continue;
        }

        const normalized = normalizeDateValue(value);
        if (normalized) {
            return normalized;
        }
    }

    return null;
};

const extractListData = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.pengumuman)) {
        return payload.pengumuman;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
    }

    if (Array.isArray(payload?.data?.pengumuman)) {
        return payload.data.pengumuman;
    }

    return [];
};

const extractItemData = (payload) => {
    if (payload?.data?.pengumuman && typeof payload.data.pengumuman === "object") {
        return payload.data.pengumuman;
    }

    if (payload?.pengumuman && typeof payload.pengumuman === "object") {
        return payload.pengumuman;
    }

    if (payload?.data?.data && typeof payload.data.data === "object") {
        return payload.data.data;
    }

    if (payload?.data && typeof payload.data === "object") {
        return payload.data;
    }

    if (payload && typeof payload === "object") {
        return payload;
    }

    return {};
};

const normalizeImageUrl = (url) => {
    if (!url) {
        return "";
    }

    const cleanedUrl = String(url)
        .trim()
        .replace(/\\\//g, "/")
        .replace(/\\/g, "/");

    if (!cleanedUrl) {
        return "";
    }

    if (/^(https?:)?\/\//i.test(cleanedUrl) || /^data:|^blob:/i.test(cleanedUrl)) {
        return cleanedUrl;
    }

    if (cleanedUrl.startsWith("/")) {
        return `${API_ORIGIN}${cleanedUrl}`;
    }

    if (!cleanedUrl.includes("/")) {
        return `${API_ORIGIN}/storage/pengumuman/${cleanedUrl}`;
    }

    return `${API_ORIGIN}/${cleanedUrl}`;
};

const normalizePengumuman = (item = {}) => ({
    id: pickValue(item.id, item.pengumuman_id, item.pengumumanId),
    judul: pickValue(item.judul, item.title, ""),
    teks: pickValue(item.teks, item.deskripsi, item.content, item.body, ""),
    deskripsi: pickValue(item.teks, item.deskripsi, item.content, item.body, ""),
    gambarUrl: normalizeImageUrl(
        pickValue(
            item.gambar_url,
            item.gambar,
            item.image_url,
            item.image,
            item.url_gambar,
            item.foto,
            item.photo,
            item.thumbnail,
            "",
        ),
    ),
    createdAt: normalizeDateValue(
        pickNonEmptyValue(
            item.create_at,
            item.created_at,
            item.createdAt,
            item.createAt,
            item.tanggal,
            item.tanggal_dibuat,
            item.tanggalDibuat,
            item.tanggal_buat,
            item.created_date,
            item.createdDate,
            item.date,
            item.published_at,
            item.publish_at,
            item.waktu,
            item.created_at?.date,
            item.create_at?.date,
            findDateLikeValue(item),
            null,
        ),
    ),
    author: pickValue(
        item.user?.nama,
        item.user?.name,
        item.user?.full_name,
        item.createdBy?.nama,
        item.createdBy?.name,
        item.author,
        item.nama_user,
        item.namaUser,
        item.pembuat,
        item.created_by_name,
        item.created_by,
        "Admin Perlengkapan",
    ),
});

const buildPengumumanFormData = (payload = {}) => {
    const formData = new FormData();
    const judul = String(payload.judul ?? "").trim();
    const teks = String(
        pickValue(payload.teks, payload.deskripsi, payload.content, ""),
    ).trim();
    const gambar = pickValue(payload.gambar, payload.image, null);
    const isFileLike =
        gambar &&
        typeof gambar === "object" &&
        (gambar instanceof Blob || typeof gambar.arrayBuffer === "function");

    formData.append("judul", judul);
    formData.append("teks", teks);
    formData.append("deskripsi", teks);

    if (isFileLike) {
        formData.append("gambar", gambar, gambar.name || "gambar.jpg");
    }

    return formData;
};

export const listPengumuman = async () => {
    const response = await apiClient.get("/pengumuman");
    return extractListData(response.data).map(normalizePengumuman);
};

export const getPengumumanDetail = async (id) => {
    const response = await apiClient.get(`/pengumuman/${id}`);
    return normalizePengumuman(extractItemData(response.data));
};

export const createPengumuman = async (payload) => {
    const response = await apiClient.post(
        "/pengumuman",
        buildPengumumanFormData(payload),
        {
            headers: {
                Accept: "application/json",
            },
        },
    );
    return normalizePengumuman(extractItemData(response.data));
};

export const updatePengumuman = async (id, payload) => {
    try {
        const response = await apiClient.put(
            `/pengumuman/${id}`,
            buildPengumumanFormData(payload),
            {
                headers: {
                    Accept: "application/json",
                },
            },
        );

        return normalizePengumuman(extractItemData(response.data));
    } catch (error) {
        if (error?.response?.status !== 405) {
            throw error;
        }

        const response = await apiClient.patch(
            `/pengumuman/${id}`,
            buildPengumumanFormData(payload),
            {
                headers: {
                    Accept: "application/json",
                },
            },
        );

        return normalizePengumuman(extractItemData(response.data));
    }
};

export const deletePengumuman = async (id) => {
    const response = await apiClient.delete(`/pengumuman/${id}`);
    return response.data;
};
