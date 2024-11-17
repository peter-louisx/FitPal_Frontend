import Axios from "axios";
import api from "./api";

const axios = Axios.create({
  baseURL: api.BASE_URL_API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    throw error;
  }
);

export default axios;
