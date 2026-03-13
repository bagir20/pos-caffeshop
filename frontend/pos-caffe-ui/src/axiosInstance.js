import axios from "axios";

const api = axios.create({
  baseURL: 'https://pos-caffeshop-8tk48xgfw-mdbagir20-2232s-projects.vercel.app/api',
  withCredentials: true,
});

export default api;