import axios from 'axios';

// آدرس بک‌ند (چون روی لوکال هستیم پورت ۳۰۰۰)
const BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// این تیکه کد، قبل از هر درخواست اجرا میشه
api.interceptors.request.use((config) => {
  // توکن رو از حافظه مرورگر میخونه
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    // اگه توکن بود، میذاره توی هدر درخواست
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// مدیریت خطاها (اگه توکن منقضی شده بود)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // هدایت به صفحه لاگین (اختیاری)
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);