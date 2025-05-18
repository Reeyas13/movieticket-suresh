import axios from "axios";
import { toast } from "react-toastify";
import { logout } from "./store/slices/authSlice";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
let store; // Variable to hold the Redux store

export const injectStore = (_store) => {
  store = _store;
};

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);
    if (
      error?.response?.status === 400 &&
      error.response.data.success === false
    ) {
      if (error.response.data.message === "Token has expired. Please relogin") {
        toast.error("token expire please login again");
        store.dispatch(logout());
      }
      if (error.response.data.message === "Invalid Token. Please Relogin") {
        toast.error("please login again and dont mess with token");
        store.dispatch(logout());
      }
      if (error.response.data.message === "Authorization header missing") {
        toast.info("please login to access this functionality");
        store.dispatch(logout());
      }
    } else if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Token has expired"
    ) {
      toast.error("please login again ,Token has expired.");
      store.dispatch(logout());
    }
    // console.log(error)
    else if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Unauthorized access."
    ) {
      toast.error("please login again ,Token has expired.");
      store.dispatch(logout());
    }
    // console.log(error);
    return Promise.reject(error);
  }
);

export default api;
