import apiClient from "./ApiClient";

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

const normalizeJabatan = (item = {}) => ({
    id: Number(item.id),
    nama: String(item.nama ?? "").trim(),
});

export const listJabatan = async () => {
    const response = await apiClient.get("/jabatans");
    return extractListData(response.data).map(normalizeJabatan);
};
