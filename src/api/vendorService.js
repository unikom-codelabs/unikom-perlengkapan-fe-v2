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

export const listVendor = async () => {
    const response = await apiClient.get("/vendors");
    return extractListData(response.data);
};

const buildVendorPayload = (payload = {}) => {
    const nama = String(payload.nama ?? payload.name ?? "").trim();

    return {
        nama,
        name: nama,
    };
};

export const createVendor = async (payload = {}) => {
    const body = buildVendorPayload(payload);

    const response = await apiClient.post("/vendors", body);

    if (response?.data?.data && typeof response.data.data === "object") {
        return response.data.data;
    }

    return response.data;
};

export const updateVendor = async (id, payload = {}) => {
    const body = buildVendorPayload(payload);

    const response = await apiClient.put(`/vendors/${id}`, body);

    if (response?.data?.data && typeof response.data.data === "object") {
        return response.data.data;
    }

    return response.data;
};

export const deleteVendor = async (id) => {
    const response = await apiClient.delete(`/vendors/${id}`);
    return response.data;
};
