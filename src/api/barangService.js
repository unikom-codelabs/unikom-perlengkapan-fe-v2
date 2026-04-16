import apiClient from "./ApiClient";

const pickValue = (...values) => values.find((value) => value !== undefined && value !== null);

const normalizeKategori = (kategori) => {
    const value = String(kategori ?? "").toLowerCase().trim();

    if (["tahunan", "atk_tahunan", "atk tahunan", "tahunan atk"].includes(value)) {
        return "tahunan";
    }

    if (["ujian", "atk_ujian", "atk ujian", "ujian atk"].includes(value)) {
        return "ujian";
    }

    if (["kelas", "atk_kelas", "atk kelas", "kelas atk"].includes(value)) {
        return "kelas";
    }

    return "tahunan";
};

const toKategoriApiValue = (kategori) => {
    const value = normalizeKategori(kategori);

    if (value === "ujian") {
        return "atk_ujian";
    }

    if (value === "kelas") {
        return "atk_kelas";
    }

    return "atk_tahunan";
};

const normalizeBarang = (item = {}) => ({
    id: pickValue(item.id, item.barang_id),
    nama: pickValue(item.nama, item.nama_barang, item.name, ""),
    satuan: pickValue(item.satuan, item.unit, "-"),
    kategori: normalizeKategori(pickValue(item.kategori, item.jenis, item.tipe, item.category, "tahunan")),
});

const extractListData = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
    }

    return [];
};

const extractItemData = (payload) => {
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

const buildBarangPayload = (payload = {}) => {
    const nama = pickValue(payload.nama, payload.nama_barang, payload.name)?.trim();
    const kategoriInput = pickValue(payload.kategori, payload.category);
    const kategori = toKategoriApiValue(kategoriInput);
    const tipe = pickValue(payload.tipe, payload.jenis, payload.type, "habis_pakai")?.trim();
    const unit = pickValue(payload.unit, payload.satuan)?.trim();
    const harga = Number(pickValue(payload.harga, 0));
    const vendorId = Number(pickValue(payload.vendor_id, payload.vendorId, 1));

    return {
        nama: nama ?? "",
        kategori,
        tipe: tipe ?? "habis_pakai",
        unit: unit ?? "",
        harga: Number.isFinite(harga) ? harga : 0,
        vendor_id: Number.isFinite(vendorId) ? vendorId : 1,
    };
};

const toFormData = (payload = {}) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        formData.append(key, String(value));
    });

    return formData;
};

export const listBarang = async (params = {}) => {
    const response = await apiClient.get("/barang", { params });
    return extractListData(response.data).map(normalizeBarang);
};

export const getBarangDetail = async (id) => {
    const response = await apiClient.get(`/barang/${id}`);
    return normalizeBarang(extractItemData(response.data));
};

export const createBarang = async (payload) => {
    const normalizedPayload = buildBarangPayload(payload);

    try {
        const response = await apiClient.post("/barang", normalizedPayload);
        return normalizeBarang(extractItemData(response.data));
    } catch (error) {
        if (error?.response?.status !== 422) {
            throw error;
        }

        const response = await apiClient.post("/barang", toFormData(normalizedPayload));
        return normalizeBarang(extractItemData(response.data));
    }
};

export const updateBarang = async (id, payload) => {
    const response = await apiClient.put(`/barang/${id}`, buildBarangPayload(payload));
    return normalizeBarang(extractItemData(response.data));
};

export const deleteBarang = async (id) => {
    const response = await apiClient.delete(`/barang/${id}`);
    return response.data;
};
