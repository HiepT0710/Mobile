import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../../app/config/apiService';
import { useColorScheme } from 'react-native';
import messaging from '@react-native-firebase/messaging';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  fullname: string;
  gender: string;
  status: number;
  roles: 'admin' | 'customer';
}

// Thêm component ProfileImage
const ProfileImage = ({ source, style }: { source: string | null, style: any }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Thêm hàm xử lý URL ảnh
  const getImageSource = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    // Nếu là base64
    if (imageUrl.startsWith('data:image')) {
      return { uri: imageUrl };
    }

    // Nếu là URL từ backend
    if (imageUrl.startsWith('http')) {
      return { uri: imageUrl };
    }

    // Nếu là tên file, thêm domain của backend
    return { uri: `${BASE_URL}/images/avatar/${imageUrl}` };
  };

  if (!source || error) {
    return (
      <View style={[style, styles.placeholderContainer]}>
        <View style={styles.placeholderIconContainer}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderText}>
            {error ? 'Không thể tải ảnh' : 'Chưa có ảnh'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[style, styles.imageWrapper]}>
      {loading && (
        <View style={[style, styles.loadingContainer]}>
          <ActivityIndicator size="small" color="#0066cc" />
        </View>
      )}
      <Image
        source={getImageSource(source)}
        style={[style, styles.profileImage]}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          console.log('Image loading error for source:', source);
          setError(true);
          setLoading(false);
        }}
      />
    </View>
  );
};

const Profile = ({ navigation, route }: { navigation: any; route: any }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSettings();
    fetchUser();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUser();
      setRefreshKey(prev => prev + 1);
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUser = async () => {
    try {
      const loginInfo = await AsyncStorage.getItem('loginInfo');
      console.log('Raw loginInfo:', loginInfo);

      if (!loginInfo) {
        throw new Error('Không tìm thấy thông tin đăng nhập');
      }

      const userData = JSON.parse(loginInfo);
      console.log('Parsed userData:', userData);
      console.log('User roles:', userData.roles);

      const userId = userData.id || userData.user?.id;
      
      const response = await apiService.getUserProfile(userId);
      console.log('API Response:', response.data);
      console.log('User roles from API:', response.data.data?.roles);

      if (response.data.status) {
        setUser(response.data.data);
        console.log('Final user state:', {
          id: response.data.data.id,
          name: response.data.data.name,
          roles: response.data.data.roles
        });
      } else {
        throw new Error(response.data.message || 'Không thể lấy thông tin người dùng');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Xóa thông tin người dùng từ AsyncStorage (nếu có)
    await AsyncStorage.removeItem('userToken'); // Thay 'userToken' bằng key bạn đã sử dụng để lưu thông tin người dùng
    navigation.navigate('SignIn'); // Điều hướng về màn hình đăng nhập
  };

  const loadSettings = async () => {
    try {
      const notificationEnabled = await AsyncStorage.getItem('notificationsEnabled');
      setIsNotificationsEnabled(notificationEnabled === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      setIsNotificationsEnabled(value);
      await AsyncStorage.setItem('notificationsEnabled', value.toString());

      if (value) {
        // Yêu cầu quyền thông báo
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Alert.alert(
            'Thông báo',
            'Vui lòng cấp quyền thông báo trong cài đặt thiết bị để nhận thông báo',
            [
              { text: 'Để sau' },
              { text: 'Mở cài đặt', onPress: () => Linking.openSettings() }
            ]
          );
          setIsNotificationsEnabled(false);
          await AsyncStorage.setItem('notificationsEnabled', 'false');
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi cài đặt thông báo');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <ProfileImage
            key={refreshKey}
            source={user?.image}
            style={styles.avatar}
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('UserDetailsScreen', { userId: user?.id })}>
          <Text style={styles.name}>{user?.name || 'Không có tên'}</Text>
        </TouchableOpacity>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('UserDetailsScreen', { userId: user?.id })}>
          <Icon name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Thông tin chi tiết</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('UpdateProfile')}>
          <Icon name="person-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Chỉnh sửa hồ sơ</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ChangePassword')}>
          <Icon name="lock-closed-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Đổi mật khẩu</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <View style={styles.option}>
          <Icon name="notifications-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Thông báo</Text>
          <Switch
            value={isNotificationsEnabled}
            onValueChange={handleNotificationsToggle}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khác</Text>
        <TouchableOpacity style={styles.option}>
          <Icon name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Trợ giúp & Hỗ trợ</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Icon name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Về chúng tôi</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quản trị</Text>
        <TouchableOpacity 
          style={styles.option} 
          onPress={() => {
            console.log('Navigating to Admin screen...'); 
            navigation.navigate('Admin');
          }}
        >
          <Icon name="settings-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Quản lý sản phẩm</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.option} 
          onPress={() => navigation.navigate('CategoryManagement')}
        >
          <Icon name="list-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Quản lý danh mục</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option} 
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Icon name="people-outline" size={24} color="#333" />
          <Text style={styles.optionText}>Quản lý người dùng</Text>
          <Icon name="chevron-forward-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  loadingContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
