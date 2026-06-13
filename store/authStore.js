import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import apiClient from "../utils/apiClient";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,

  // Load saved session on app start
  loadSession: async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const userStr = await AsyncStorage.getItem("user");
      if (token && userStr) {
        set({
          accessToken: token,
          user: JSON.parse(userStr),
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Session load error:", error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user, accessToken, isAuthenticated: true, isLoading: false });
      return { success: true, role: user.role };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || "Login failed.",
      };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post("/auth/register", userData);
      const { user, accessToken, refreshToken } = res.data.data;
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user, accessToken, isAuthenticated: true, isLoading: false });
      return { success: true, role: user.role };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed.",
      };
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {}
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (updatedUser) => {
    set({ user: updatedUser });
    AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  },
}));

export default useAuthStore;
