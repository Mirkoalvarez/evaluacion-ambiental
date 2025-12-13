import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
};

// Rehidrata token si estaba guardado
if (typeof localStorage !== 'undefined') {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
        setAuthToken(savedToken);
    }
}

// Asegura que siempre enviamos el token si existe en localStorage
api.interceptors.request.use((config) => {
    if (!config.headers.Authorization && typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers.authorization = `Bearer ${token}`; // por si el servidor espera minúsculas
        }
    }
    return config;
});

// Si el token es inválido o falta, redirige a /auth
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            delete api.defaults.headers.common.Authorization;
            if (typeof window !== 'undefined') {
                window.location.assign('/auth');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
