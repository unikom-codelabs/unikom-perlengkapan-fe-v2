import apiClient from "./ApiClient";

export const login = async (email, password) => {
    const response = await apiClient.post("/login", { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await apiClient.post("/logout");
    return response.data;
};

export const getMe = async () => {
    const response = await apiClient.get("/me");
    return response.data;
};
