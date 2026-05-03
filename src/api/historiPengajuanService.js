import apiClient from "../api/ApiClient"; // sesuaikan path import

/**
 * Mengambil histori pengajuan dari API.
 * @param {Object} params - Query parameter opsional
 * @param {string|number} [params.tahun] - Filter berdasarkan tahun (contoh: "2025")
 * @returns {Promise<Array>} Array data histori pengajuan
 */
export const getHistoriPengajuan = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

  const response = await apiClient.get("/histori-pengajuan", { params: cleanParams });
  return response.data?.data ?? [];
};
