import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { getAuthToken } from './authToken';

export type ApiError = Error & {
  status?: number;
  data?: unknown;
  code?: string;
};

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://www.teachteachbaby.top/api';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getResponseMessage(data: unknown) {
  if (isRecord(data) && typeof data.message === 'string') {
    return data.message;
  }

  return '';
}

function normalizeApiError(error: AxiosError): ApiError {
  const message =
    getResponseMessage(error.response?.data) ||
    (error.code === 'ERR_NETWORK'
      ? '网络连接异常，请稍后重试'
      : error.message || '请求失败，请稍后重试');
  const apiError = new Error(message) as ApiError;

  apiError.status = error.response?.status;
  apiError.data = error.response?.data;
  apiError.code = error.code;

  return apiError;
}

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => Promise.reject(normalizeApiError(error)),
);

export default request;
