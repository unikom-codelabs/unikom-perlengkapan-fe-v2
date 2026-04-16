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
