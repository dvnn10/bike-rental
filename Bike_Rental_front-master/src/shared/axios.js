import Axios from 'axios';
import { getApiToken, isAuthenticated } from './helper';
import url from './url';

const axios = Axios.create({
  baseURL: url.frontend_url,
});

// request interceptor to add the token
axios.interceptors.request.use(async (request) => {
  const isAuth = isAuthenticated();
  const token = getApiToken();

  if (isAuth && token) {
    request.headers['Authorization'] = `Bearer ${token}`;
    request.headers['Content-Type'] = 'application/json';
  }
  return request;
});

const REFRESH_TOKEN_ERROR_MESSAGES = [
  'No/Invalid Token, Auth is denied.',
  'User Email not activated.',
  'User Email not activated or is not Admin',
];

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        if (REFRESH_TOKEN_ERROR_MESSAGES.includes(error.response.msg)) {
        }
      } else {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
