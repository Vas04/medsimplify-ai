import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const uploadReport = async (file) => {
  const formData = new FormData();

  formData.append("report", file);

  const response = await api.post("/reports/upload", formData);

  return response.data;
};

export default api;