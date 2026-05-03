import apiClient from "./ApiClient";

const JABATAN_ENDPOINTS = ["/jabatans", "/jabatan"];

const toIdString = (value) => {
    if (value === undefined || value === null) {
        return "";
    }

    const normalized = String(value).trim();
    return normalized;
};

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
    id: toIdString(item.id ?? item.id_jabatan ?? item.jabatan_id),
    nama: String(item.nama ?? item.name ?? "").trim(),
});

export const listJabatan = async () => {
    for (const endpoint of JABATAN_ENDPOINTS) {
        try {
            const response = await apiClient.get(endpoint);
            return extractListData(response.data)
                .map(normalizeJabatan)
                .filter((item) => item.id && item.nama);
        } catch (error) {
            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }

    return [];
};

export const createJabatan = async (payload = {}) => {
    const body = {
        nama: String(payload.nama ?? payload.name ?? "").trim(),
    };

    let lastError = null;

    for (const endpoint of JABATAN_ENDPOINTS) {
        try {
            const response = await apiClient.post(endpoint, body);
            const data = response?.data?.data ?? response.data;
            return normalizeJabatan(data);
        } catch (error) {
            lastError = error;

            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }

    throw lastError ?? new Error("Endpoint jabatan tidak ditemukan.");
};

export const updateJabatan = async (id, payload = {}) => {
    const body = {
        nama: String(payload.nama ?? payload.name ?? "").trim(),
    };

    let lastError = null;

    for (const endpoint of JABATAN_ENDPOINTS) {
        try {
            const response = await apiClient.put(`${endpoint}/${id}`, body);
            const data = response?.data?.data ?? response.data;
            return normalizeJabatan(data);
        } catch (error) {
            lastError = error;

            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }

    throw lastError ?? new Error("Endpoint jabatan tidak ditemukan.");
};

export const deleteJabatan = async (id) => {
    let lastError = null;

    for (const endpoint of JABATAN_ENDPOINTS) {
        try {
            const response = await apiClient.delete(`${endpoint}/${id}`);
            return response.data;
        } catch (error) {
            lastError = error;

            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }

    throw lastError ?? new Error("Endpoint jabatan tidak ditemukan.");
};
