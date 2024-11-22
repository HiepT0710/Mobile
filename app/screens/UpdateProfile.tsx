import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, Platform, ScrollView } from 'react-native';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { apiService } from '../config/apiService';
import BASE_URL from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UpdateProfile = ({ navigation }: { navigation: any }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // Thêm states cho các trường từ database
  const [formData, setFormData] = useState({
    name: '',
    fullname: '',
    email: '',
    phone: '',
    address: '',
    gender: 'Nam',
    image: null as any
  });

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('loginInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        const userId = userData.id || userData.user?.id;
        
        if (!userId) {
          throw new Error('User ID not found');
        }

        setUserId(userId);
        
        // Gọi API lấy thông tin profile
        const response = await apiService.getUserProfile(userId);
        
        if (response.data.status) {
          const userProfile = response.data.data;
          setFormData({
            name: userProfile.name || '',
            fullname: userProfile.fullname || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            address: userProfile.address || '',
            gender: userProfile.gender || '',
            image: userProfile.image || null
          });
        } else {
          throw new Error(response.data.message || 'Failed to get user profile');
        }
      } else {
        // Redirect to login if no user info found
        navigation.replace('SignIn');
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      Alert.alert(
        'Lỗi',
        'Không th lấy thông tin người dùng. Vui lòng đăng nhập lại.'
      );
      // Clear stored data and redirect to login
      await AsyncStorage.clear();
      navigation.replace('SignIn');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!userId) {
        throw new Error('User ID not found');
      }

      setLoading(true);
      setShowError(false);
      setShowSuccess(false);

      // Validate các trường
      if (!formData.name.trim()) {
        Alert.alert('Lỗi', 'Tên đăng nhập không được để trống');
        return;
      }

      if (!formData.email.trim()) {
        Alert.alert('Lỗi', 'Email không được để trống');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Lỗi', 'Email không đúng định dạng');
        return;
      }

      if (!formData.phone.trim()) {
        Alert.alert('Lỗi', 'Số điện thoại không được để trống');
        return;
      }

      // Validate phone number (Vietnam format)
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(formData.phone)) {
        Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await apiService.updateUser(userId, formDataToSend);

      if (response.data.status) {
        // Update stored user info
        const userInfo = await AsyncStorage.getItem('loginInfo');
        if (userInfo) {
          const userData = JSON.parse(userInfo);
          userData.user = { ...userData.user, ...formData };
          await AsyncStorage.setItem('loginInfo', JSON.stringify(userData));
        }

        setShowSuccess(true);
        
        // Thêm delay ngắn để hiển thị thông báo thành công
        setTimeout(() => {
          navigation.navigate('Profile', { 
            refresh: true,
            timestamp: new Date().getTime() 
          });
        }, 1000);
      } else {
        setShowError(true);
        Alert.alert('Lỗi', response.data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update error:', error);
      setShowError(true);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePhoto = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 300,
      maxHeight: 300,
      includeBase64: true,
      selectionLimit: 1,
      // Cho phép nhiều định dạng ảnh
      presentationStyle: 'fullScreen',
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        const source = response.assets[0];
        
        // Kiểm tra định dạng file được hỗ trợ
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const fileType = source.type || 'image/jpeg';
        
        if (!supportedTypes.includes(fileType)) {
          Alert.alert(
            'Lỗi',
            'Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WEBP hoặc GIF'
          );
          return;
        }

        if (source.base64) {
          // Format base64 string với đúng mime type
          const base64Image = `data:${fileType};base64,${source.base64}`;
          setImageUri(base64Image);
          
          const formDataToSend = new FormData();
          formDataToSend.append('image', base64Image);
          // Thêm các field khác
          formDataToSend.append('name', formData.name);
          formDataToSend.append('email', formData.email);
          formDataToSend.append('phone', formData.phone);
          formDataToSend.append('address', formData.address || '');
          formDataToSend.append('fullname', formData.fullname || '');
          formDataToSend.append('gender', formData.gender || '');

          apiService.updateUser(userId, formDataToSend)
            .then(response => {
              if (response.data.status) {
                setShowSuccess(true);
                setFormData(prev => ({
                  ...prev,
                  image: base64Image
                }));
                
                // Cập nhật cache
                AsyncStorage.getItem('loginInfo').then(userInfo => {
                  if (userInfo) {
                    const userData = JSON.parse(userInfo);
                    userData.user = { ...userData.user, image: base64Image };
                    AsyncStorage.setItem('loginInfo', JSON.stringify(userData));
                  }
                });
              }
            })
            .catch(error => {
              console.error('Upload error:', error);
              setShowError(true);
              Alert.alert(
                'Lỗi',
                'Không thể tải ảnh lên. Vui lòng thử lại'
              );
            });
        }
      }
    });
  };

  // Thêm hàm helper
  const isValidBase64 = (str: string) => {
    if (!str?.startsWith('data:image')) {
      console.log('Missing data:image prefix');
      return false;
    }
    try {
      return btoa(atob(str.split(',')[1])) === str.split(',')[1];
    } catch (err) {
      console.log('Invalid base64 string');
      return false;
    }
  };

  // Helper function để kiểm tra và format URL ảnh
  const getImageSource = (imageData: string | null) => {
    if (!imageData) return null;

    // Kiểm tra nếu là URL
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return { uri: imageData };
    }

    // Kiểm tra nếu là base64 với prefix
    if (imageData.startsWith('data:image')) {
      return { uri: imageData };
    }

    // Kiểm tra nếu là base64 không có prefix
    if (imageData.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
      return { uri: `data:image/jpeg;base64,${imageData}` };
    }

    // Kiểm tra nếu là đường dẫn local
    if (imageData.startsWith('/')) {
      return { uri: `file://${imageData}` };
    }

    return null;
  };

  // Component hiển thị ảnh
  const ProfileImage = ({ source, style }: { source: string | null, style: any }) => {
    const [error, setError] = useState(false);

    if (!source || error) {
      return (
        <View style={[style, styles.placeholderContainer]}>
          <View style={styles.placeholderIconContainer}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>
              {error ? 'Không thể tải ảnh' : 'Chọn ảnh'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: source }}
        style={style}
        resizeMode="cover"
        onError={() => setError(true)}
        progressiveRenderingEnabled={true}
        fadeDuration={300}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Cập Nhật Thông Tin</Text>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleChoosePhoto} style={styles.imageWrapper}>
            <ProfileImage
              source={imageUri || formData.image}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleChoosePhoto}
            style={styles.changePhotoButton}
          >
            <Text style={styles.changePhotoText}>
              {imageUri ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên đăng nhập"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            maxLength={50}
          />

          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            value={formData.fullname}
            onChangeText={(text) => setFormData({...formData, fullname: text})}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ"
            value={formData.address}
            onChangeText={(text) => setFormData({...formData, address: text})}
          />

          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[
                styles.genderOption,
                formData.gender === 'Nam' && styles.genderSelected
              ]}
              onPress={() => setFormData({...formData, gender: 'Nam'})}
            >
              <Text style={[
                styles.genderText,
                formData.gender === 'Nam' && styles.genderTextSelected
              ]}>Nam</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.genderOption,
                formData.gender === 'Nữ' && styles.genderSelected
              ]}
              onPress={() => setFormData({...formData, gender: 'Nữ'})}
            >
              <Text style={[
                styles.genderText,
                formData.gender === 'Nữ' && styles.genderTextSelected
              ]}>Nữ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showSuccess && (
          <View style={styles.messageContainer}>
            <Text style={styles.successMessage}>
              ✓ Cập nhật thông tin thành công! Đang chuyển hướng...
            </Text>
          </View>
        )}

        {showError && (
          <View style={styles.messageContainer}>
            <Text style={styles.errorMessage}>
              ⚠️ Cập nhật thất bại!
            </Text>
            <Text style={styles.errorDetail}>
              Vui lòng kiểm tra lại các thông tin:
            </Text>
            <Text style={styles.errorDetail}>
              • Tên đăng nhập không được để trống
            </Text>
            <Text style={styles.errorDetail}>
              • Email phải đúng định dạng
            </Text>
            <Text style={styles.errorDetail}>
              • Số điện thoại phải hợp lệ
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '100%',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  messageContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  successMessage: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  errorMessage: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDetail: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
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
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
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
  placeholderIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  changePhotoButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  changePhotoText: {
    color: '#0066cc',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  genderOption: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  genderSelected: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  genderText: {
    color: '#333',
    fontSize: 16,
  },
  genderTextSelected: {
    color: '#fff',
  },
});

export default UpdateProfile;
