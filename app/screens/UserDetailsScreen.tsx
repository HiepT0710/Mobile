import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../config/apiService';

const UserDetailsScreen = ({ navigation }: { navigation: any }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('loginInfo');
      console.log('Raw userInfo from storage:', userInfo);
      
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        console.log('Parsed userData:', userData);
        
        const userEmail = userData.email;
        
        if (!userEmail) {
          console.error('Cannot find user email in stored data');
          setUser(null);
          return;
        }

        const response = await apiService.getUserDetailsByEmail(userEmail);
        console.log('Full API Response:', response);
        
        if (response.data) {
          setUser(response.data.data || response.data);
          console.log('Set user data:', response.data.data || response.data);
        } else {
          throw new Error('No data in API response');
        }
      } else {
        console.error('No user info in storage');
        setUser(null);
      }
    } catch (error) {
      console.error('Error in fetchUser:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = user?.id;
      const response = await apiService.deleteUserAccount(userId);

      if (response.status) {
        await AsyncStorage.removeItem('loginInfo');
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Could not delete account. Please try again.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!user) {
    return <Text>Không tìm thấy thông tin người dùng.</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin người dùng</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
          <Icon name="home" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Họ và tên: {user?.fullname}</Text>
        <Text style={styles.label}>Email: {user?.email}</Text>
        <Text style={styles.label}>Tên đăng nhập: {user?.name}</Text>
        <Text style={styles.label}>Số điện thoại: {user?.phone}</Text>
        <Text style={styles.label}>Địa chỉ: {user?.address || 'Chưa cập nhật'}</Text>
        <Text style={styles.label}>Giới tính: {user?.gender || 'Chưa cập nhật'}</Text>
        <Text style={styles.label}>Trạng thái: {user?.status === 1 ? 'Đang hoạt động' : 'Không hoạt động'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleDeleteAccount}
      >
        <Text style={styles.logoutText}>Xóa tài khoản</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  iconButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen;
