import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { apiService } from '../config/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePassword = ({ navigation }: { navigation: any }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const checkPassword = (text: string) => {
    setRequirements({
      length: text.length >= 6,
      uppercase: /[A-Z]/.test(text),
      lowercase: /[a-z]/.test(text),
      number: /[0-9]/.test(text),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(text)
    });
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('loginInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        setUserId(userData.id);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      setShowError(false);
      setShowSuccess(false);

      if (!oldPassword) {
        setShowError(true);
        return;
      }

      if (!Object.values(requirements).every(req => req)) {
        setShowError(true);
        return;
      }

      if (oldPassword === password) {
        setShowError(true);
        return;
      }

      setLoading(true);

      const response = await apiService.changePassword(userId, {
        oldPassword,
        password
      });

      if (response.data.status) {
        setShowSuccess(true);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setShowError(true);
      }
    } catch (error: any) {
      console.error('Lỗi đổi mật khẩu:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Đổi Mật Khẩu</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu hiện tại"
          placeholderTextColor="#999"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setShowRequirements(true);
            checkPassword(text);
          }}
          onFocus={() => setShowRequirements(true)}
        />
      </View>

      {showRequirements && (
        <View style={styles.requirementsContainer}>
          <View style={styles.requirementHeader}>
            <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
          </View>
          
          <View style={styles.requirementList}>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirementText, requirements.length && styles.requirementMet]}>
                {requirements.length ? '✓' : '•'} Ít nhất 6 ký tự
              </Text>
            </View>

            <View style={styles.requirementItem}>
              <Text style={[styles.requirementText, requirements.uppercase && styles.requirementMet]}>
                {requirements.uppercase ? '✓' : '•'} Một chữ in hoa
              </Text>
            </View>

            <View style={styles.requirementItem}>
              <Text style={[styles.requirementText, requirements.lowercase && styles.requirementMet]}>
                {requirements.lowercase ? '✓' : '•'} Một chữ thường
              </Text>
            </View>

            <View style={styles.requirementItem}>
              <Text style={[styles.requirementText, requirements.number && styles.requirementMet]}>
                {requirements.number ? '✓' : '•'} Một chữ số
              </Text>
            </View>

            <View style={styles.requirementItem}>
              <Text style={[styles.requirementText, requirements.special && styles.requirementMet]}>
                {requirements.special ? '✓' : '•'} Một ký tự đặc biệt
              </Text>
            </View>
          </View>
        </View>
      )}

      {showSuccess && (
        <View style={styles.messageContainer}>
          <Text style={styles.successMessage}>
            ✓ Đổi mật khẩu thành công! Đang chuyển hướng...
          </Text>
        </View>
      )}

      {showError && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorMessage}>
            ⚠️ Đổi mật khẩu thất bại!
          </Text>
          <Text style={styles.errorDetail}>
            Vui lòng kiểm tra lại:
          </Text>
          <Text style={styles.errorDetail}>
            • Mật khẩu hiện tại có chính xác không
          </Text>
          <Text style={styles.errorDetail}>
            • Mật khẩu mới đã đáp ứng đủ các yêu cầu chưa
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang đổi...' : 'Đổi Mật Khẩu'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
  requirementsContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  requirementHeader: {
    marginBottom: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  requirementList: {
    gap: 5,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
  },
  requirementMet: {
    color: '#4CAF50',
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
});

export default ChangePassword;
