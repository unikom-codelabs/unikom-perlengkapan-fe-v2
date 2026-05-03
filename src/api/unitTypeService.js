import apiClient from "./ApiClient";

const UNIT_TYPE_ENDPOINTS = ["/unit-types", "/unit-type"];

const toIdString = (value) => {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
};

const toNullableNumber = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const extractListData = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.unit_types)) {
        return payload.unit_types;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.data?.unit_types)) {
        return payload.data.unit_types;
    }

    if (Array.isArray(payload?.data?.data)) {
        return payload.data.data;
    }

    return [];
};

const normalizeUnitType = (item = {}, fallbackParent = null) => {
    const parentObject =
        item?.parent && typeof item.parent === "object" ? item.parent : null;

    const fallbackParentId =
        fallbackParent && typeof fallbackParent === "object"
            ? fallbackParent.id
            : fallbackParent;
    const fallbackParentName =
        fallbackParent && typeof fallbackParent === "object"
            ? fallbackParent.nama
            : "";

    const itemId = toIdString(
        item.id ?? item.unit_id ?? item.id_unit_type ?? item.unit_type_id,
    );

    const rawParentId =
        item.parent_id ??
        item.parentId ??
        item.unit_parent_id ??
        item.id_jabatan ??
        item.jabatan_id ??
        parentObject?.id ??
        fallbackParentId;
    const parentIdAsString = toIdString(rawParentId);

    return {
        id: itemId,
        nama: String(item.nama ?? item.name ?? "").trim(),
        parentId:
            parentIdAsString === ""
                ? null
                : toNullableNumber(parentIdAsString) ?? parentIdAsString,
        parentNama: String(
            item.parent_nama ??
            item.parentName ??
            item.jabatan_nama ??
            item.jabatanName ??
            parentObject?.nama ??
            parentObject?.name ??
            fallbackParentName ??
            "",
        ).trim(),
    };
};

const flattenUnitTypeTree = (items = [], fallbackParent = null) => {
    return items.flatMap((item) => {
        const normalizedItem = normalizeUnitType(item, fallbackParent);
        const children = Array.isArray(item?.children)
            ? flattenUnitTypeTree(item.children, normalizedItem)
            : [];

        return [normalizedItem, ...children];
    });
};

const buildUnitTypePayload = (payload = {}) => {
    const nama = String(payload.nama ?? payload.name ?? "").trim();

    const rawParentId = payload.parent_id ?? payload.parentId;
    const normalizedParentId = toNullableNumber(rawParentId);

    const body = {
        nama,
        name: nama,
    };

    if (rawParentId !== undefined && rawParentId !== null && rawParentId !== "") {
        body.parent_id = normalizedParentId ?? String(rawParentId).trim();
    }

    return body;
};

export const listUnitType = async ({ parentId } = {}) => {
    const params = {};

    if (parentId === null) {
        params.parent_id = "null";
    } else if (parentId !== undefined && parentId !== "") {
        params.parent_id = String(parentId);
    }

    for (const endpoint of UNIT_TYPE_ENDPOINTS) {
        try {
            const response = await apiClient.get(endpoint, {
                params: Object.keys(params).length > 0 ? params : undefined,
            });
            const fallbackParentForList =
                parentId === undefined ? null : parentId;

            return flattenUnitTypeTree(
                extractListData(response.data),
                fallbackParentForList,
            );
        } catch (error) {
            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }

    return [];
};

export const listUnitTypeByParentId = async (parentId) => {
    return listUnitType({ parentId });
};

export const createUnitType = async (payload = {}) => {
    const body = buildUnitTypePayload(payload);
    let lastError = null;

    for (const endpoint of UNIT_TYPE_ENDPOINTS) {
        try {
            const response = await apiClient.post(endpoint, body);
            const responseData = response?.data?.data ?? response.data;
            return normalizeUnitType(responseData);
        } catch (error) {
            lastError = error;

            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }

    throw lastError ?? new Error("Endpoint unit type tidak ditemukan.");
};

export const updateUnitType = async (id, payload = {}) => {
    const body = buildUnitTypePayload(payload);
    let lastError = null;

    for (const endpoint of UNIT_TYPE_ENDPOINTS) {
        try {
            const response = await apiClient.put(`${endpoint}/${id}`, body);
            const responseData = response?.data?.data ?? response.data;
            return normalizeUnitType(responseData);
        } catch (error) {
            lastError = error;

            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }

    throw lastError ?? new Error("Endpoint unit type tidak ditemukan.");
};

export const deleteUnitType = async (id) => {
    let lastError = null;

    for (const endpoint of UNIT_TYPE_ENDPOINTS) {
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

    throw lastError ?? new Error("Endpoint unit type tidak ditemukan.");
};
