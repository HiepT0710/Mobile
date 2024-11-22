import axiosInstance from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';

// Thêm interface cho request forgot password
interface ForgotPasswordRequest {
  name: string;
  email: string;
  phone: string;
}

interface RegisterRequest {
  name: string;
  fullname: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: string;
  status: number;
  roles: number;
}

// Thêm vào interface hiện có
interface ApiService {
  // ... các phương thức khác
  createProduct: (formData: FormData) => Promise<any>;
  getBrands: () => Promise<any>;
  getCategories: () => Promise<any>;
  createCategory: (data: any) => Promise<any>;
  updateCategory: (id: number, data: any) => Promise<any>;
  deleteCategory: (id: number) => Promise<any>;
  getUsers: () => Promise<any>;
  updateUser: (id: number, data: any) => Promise<any>;
  deleteUser: (id: number) => Promise<any>;
  deleteUserAccount: (userId: number) => Promise<any>;
  getRoles: () => Promise<any>;
  getRelatedProducts: (productId: string) => Promise<any>;
}

export const apiService = {
  getUserDetailsByEmail: async (email: string) => {
    try {
      console.log('Calling getUserDetailsByEmail with email:', email);
      const response = await axiosInstance.get(`/user/email/${email}`);
      console.log('getUserDetailsByEmail response:', response.data);
      return response;
    } catch (error) {
      console.error('getUserDetailsByEmail error:', error);
      throw error;
    }
  },

  login: async (data: { name: string; password: string }) => {
    try {
      console.log('Logging in with credentials:', data);
      const response = await axiosInstance.post('/login', data);
      console.log('Login response:', response.data);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/categories');
      return response;
    } catch (error) {
      console.error('getCategories error:', error);
      throw error;
    }
  },

  getProducts: async () => {
    try {
      const response = await axiosInstance.get('/products');
      return response;
    } catch (error) {
      console.error('getProducts error:', error);
      throw error;
    }
  },

  updateUser: (userId: number, formData: FormData) => {
    console.log('Sending update request with formData:', formData);
    return axiosInstance.post(`/user/update/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
  },

  changePassword: async (userId: number, data: { oldPassword: string; password: string }) => {
    try {
      console.log('Sending change password request:', { userId, data });
      const response = await axiosInstance.put(`/user/change-password/${userId}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response;
    } catch (error: any) {
      console.error('Change password error:', error.response?.data);
      throw error;
    }
  },

  getUserProfile: async (userId: number) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      const response = await axiosInstance.get(`/users/${userId}`);
      console.log('User profile response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    try {
      const response = await axiosInstance.post('/forgot-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      const response = await axiosInstance.post('/register', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createProduct: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post('/products', formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },

  getBrands: async () => {
    try {
      const response = await axiosInstance.get('/brands');
      return response;
    } catch (error) {
      console.error('getBrands error:', error);
      throw error;
    }
  },

  createCategory: async (data: { name: string; status: number }) => {
    try {
      const response = await axiosInstance.post('/categories', data);
      return response;
    } catch (error) {
      console.error('createCategory error:', error);
      throw error;
    }
  },

  updateCategory: async (id: number, data: { name: string; status: number }) => {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, data);
      return response;
    } catch (error) {
      console.error('updateCategory error:', error);
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('deleteCategory error:', error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await axiosInstance.get('/users');
      return response;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  updateUser: async (id: number, data: any) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, data);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  deleteUserAccount: async (userId: number) => {
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản người dùng:', error);
      throw error;
    }
  },

  getRoles: async () => {
    try {
      const response = await axiosInstance.get('/roles');
      return response;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  },

  getRelatedProducts: async (productId: string) => {
    try {
      const response = await axiosInstance.get(`/products/${productId}/related`);
      return response;
    } catch (error) {
      console.error('getRelatedProducts error:', error);
      throw error;
    }
  },
};

export default apiService; 