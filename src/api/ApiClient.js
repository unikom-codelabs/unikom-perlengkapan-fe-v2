import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { clearToken, isTokenExpired, loadToken } from "../utils/tokenUtils";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = loadToken();

        
        if (token && isTokenExpired(token)) {
            clearToken();
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
            return Promise.reject(new axios.Cancel("Token expired"));
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData && config.headers) {
            if (typeof config.headers.delete === "function") {
                config.headers.delete("Content-Type");
            }
            if (typeof config.headers.set === "function") {
                config.headers.set("Content-Type", undefined);
            }
            delete config.headers["Content-Type"];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            clearToken();
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
