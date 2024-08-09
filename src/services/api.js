// src/api/api.js
import { BaseUrl } from "@/constants/BaseUrl";
import { store } from "@/redux/store";
import axios from "axios";

export const api = axios.create({
  withCredentials: false,
  baseURL: `${BaseUrl}/api`,
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const authToken = state.auth.token;
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);
