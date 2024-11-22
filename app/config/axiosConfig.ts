import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost/mobile-backend/public/api';

// Tạo một instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Thời gian chờ (milliseconds)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.log('Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
