import apiClient from "./ApiClient";

const toNumberOrNull = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

export const fetchCetakBerkasAdmin = async (payload = {}) => {
    const tahun = toNumberOrNull(payload.tahun);
    const idAktivasi = toNumberOrNull(payload.id_aktivasi ?? payload.idAktivasi);
    const tipe = String(payload.tipe ?? "").trim().toLowerCase();
    const kategoriAtk = String(payload.kategori_atk ?? payload.kategoriAtk ?? "")
        .trim()
        .toLowerCase();

    const body = {};

    if (tahun !== null) {
        body.tahun = tahun;
    }

    if (idAktivasi !== null) {
        body.id_aktivasi = idAktivasi;
    }

    if (tipe) {
        body.tipe = tipe;
    }

    if (kategoriAtk) {
        body.kategori_atk = kategoriAtk;
    }

    const response = await apiClient.get("/admin/cetak-berkas", {
        params: body,
    });
    return response?.data?.data ?? response?.data ?? null;
};
