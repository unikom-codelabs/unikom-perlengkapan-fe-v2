import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://perlengkapan.codelabspace.or.id/api",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
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
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

