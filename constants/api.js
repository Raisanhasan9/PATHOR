const isWeb =
  typeof window !== "undefined" && window.location?.hostname === "localhost";

export const API_BASE_URL = isWeb
  ? "http://localhost:5000/api"
  : "http://192.168.1.104:5000/api";
