import apiClient from "../api/ApiClient"; 


export const getHistoriPengajuan = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

  const response = await apiClient.get("/histori-pengajuan/my", { params: cleanParams });
  return response.data?.data ?? [];
};


export const getHistoriPengajuanAdmin = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

  const response = await apiClient.get("/histori", { params: cleanParams });
  return response.data?.data ?? [];
};
