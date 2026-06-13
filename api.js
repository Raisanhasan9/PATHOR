import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Your local IP — React Native can't use "localhost"
export const BASE_URL = "http://192.168.1.104:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      // navigation to login handled per-screen
    }
    return Promise.reject(error);
  },
);

export default api;
