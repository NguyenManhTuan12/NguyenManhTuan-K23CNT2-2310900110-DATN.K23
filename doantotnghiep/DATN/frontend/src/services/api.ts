import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3011/api",
});

export default api;