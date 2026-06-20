import axios from "axios";
import { CustomError } from "@/types/custom-error.type";
import { getAuthToken } from "./auth-token";
import { ENV } from "./get-env";

const baseURL = ENV.VITE_API_BASE_URL;

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

//*** FOR API WITH TOKEN */
export const API = axios.create(options);

API.interceptors.request.use(async (config) => {
  const accessToken = await getAuthToken();
  if (accessToken) {
    config.headers["Authorization"] = "Bearer " + accessToken;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { data, status } = error.response;
    if (status === 401) {
      window.location.href = "/sign-in";
    }

    const customError: CustomError = {
      ...error,
      message: data?.message,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

//*** FOR API DONT NEED TOKEN */
export const PublicAPI = axios.create(options);

PublicAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { data } = error.response;
    const customError: CustomError = {
      ...error,
      message: data?.message,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };
    return Promise.reject(customError);
  }
);
