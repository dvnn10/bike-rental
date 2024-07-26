import axios from './axios';
import { getApiToken } from './helper';
import url from './url';

const api = {
  auth: {
    login: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'auth/login',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },

    register: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'auth/register',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    resendVerificationEmail: async (token) => {
      return axios({
        method: 'GET',
        url: url.base_api + 'auth/verification/get-activation-email',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    sendResetOtp: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'auth/password-reset/get-code',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    validateOtp: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'auth/password-reset/otpverify',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    changePassword: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'auth/password-reset/verify',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },

    logout: async (data) => {
      return axios({
        method: 'GET',
        url: url.base_api + 'auth/logout',
        data: data,
        headers: { 'x-auth-token': localStorage.getItem('apiToken') },
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
  },
  user: {
    getUser: async () => {
      return axios({
        method: 'GET',
        url: url.base_api + 'user/get/me',
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    getBikes: async (data) => {
      return axios({
        method: 'GET',
        url: url.base_api + 'bike/' + data,
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    addReservation: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'reservation/reserve-bike',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    addRating: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'rating/rate-bike',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    cancelReservation: async (data) => {
      return axios({
        method: 'PATCH',
        url: url.base_api + 'reservation/cancel-reservation',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    getReservations: async (data) => {
      return axios({
        method: 'GET',
        url: url.base_api + 'reservation/' + data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
  },
  manager: {
    getBikes: async (data) => {
      return axios({
        method: 'GET',
        url: url.base_api + 'bike/' + data,
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    deleteBike: async (data) => {
      return axios({
        method: 'DELETE',
        url: url.base_api + 'bike/delete-bike/' + data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    getUsers: async (data) => {
      return axios({
        method: 'GET',
        url: url.base_api + 'user/manager/getuser/' + data,
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    getReservations: async (data) => {
      return axios({
        method: 'GET',
        url: url.base_api + 'reservation/user-reservation/' + data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    cancelReservation: async (data) => {
      return axios({
        method: 'PATCH',
        url: url.base_api + 'reservation/cancel-reservation',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    deleteUser: async (data) => {
      return axios({
        method: 'DELETE',
        url: url.base_api + 'auth/delete-user-account/' + data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    addEditBike: async (type, datas, images) => {
      console.log(datas);
      let formData = new FormData();
      const token = await getApiToken();

      Object.keys(datas).map(function (key) {
        console.log();
        formData.append(key, datas[key]);
      });

      for (const key of Object.keys(images)) {
        console.log(images[key]);
        formData.append('images', images[key]);
      }

      console.log(formData);

      return axios({
        method: 'POST',
        url: url.base_api + 'bike/' + type,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    editUser: async (userId, data) => {
      return axios({
        method: 'PATCH',
        url: url.base_api + 'user/' + userId,
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
    addUser: async (data) => {
      return axios({
        method: 'POST',
        url: url.base_api + 'auth/manage/register',
        data: data,
      })
        .then((res) => res.data)
        .catch((err) => err.response.data);
    },
  },
};

export default api;
