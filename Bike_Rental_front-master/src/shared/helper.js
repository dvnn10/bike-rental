import { Redirect } from 'react-router-dom';
import addWeeks from 'moment';

export function getUserInfo() {
  return JSON.parse(localStorage.getItem('userInfo'));
}
export function getApiToken() {
  return localStorage.getItem('apiToken');
}
export function isAuthenticated() {
  return !(localStorage.getItem('apiToken') === null);
}

export function setLocalData(key, value) {
  localStorage.setItem(key, value);
}

export function getLocalData(key) {
  localStorage.getItem(key);
}

export function redirectToLogin() {
  <Redirect to='/login' />;
}

export function redirectToDashboard() {
  <Redirect to='/user' />;
}

export function redirectToHome() {
  <Redirect to='/home' />;
}

export function redirectHelper(history) {
  if (isAuthenticated()) {
    if (getUserInfo().role === 'manager') {
      history.push('/manager');
    } else if (getUserInfo().role === 'user') {
      history.push('/user');
    }
  }
}

export const logout = (history) => {
  localStorage.clear();
  history.push('/');
};
