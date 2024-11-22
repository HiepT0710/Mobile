import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { apiService } from '../config/apiService';

const ForgetScreen = ({ navigation }: { navigation: any }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    name: ''
  });

  // Validate email
  const validateEmail = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !text.includes('@')) {
      setErrors(prev => ({...prev, email: 'Email phải chứa ký tự @'}));
    } else {
      setErrors(prev => ({...prev, email: ''}));
    }
  };

  // Thêm hàm xử lý fullname
  const handleFullname = (text: string) => {
    // Xóa khoảng trắng ở đầu và cuối, và thay thế nhiều khoảng trắng giữa các từ bằng một khoảng trắng
    const trimmedText = text.trim().replace(/\s+/g, ' ');
    setName(trimmedText);
  };

  const handleSubmit = async () => {
    try {
      // Validate input
      if (email.trim() === '' || phone.trim() === '' || name.trim() === '') {
        setMessage('Vui lòng nhập đầy đủ thông tin');
        return;
      }

      if (!email.includes('@')) {
        setMessage('Email không hợp lệ');
        return;
      }

      // Thêm console.log để debug
      console.log('Sending request with:', {
        name,
        email,
        phone
      });

      const response = await apiService.forgotPassword({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });

      console.log('Response:', response); // Debug response

      if (response.data.status) {
        setMessage('Thông tin xác thực chính xác');
        setPassword(response.data.password);
        setIsSubmitted(true);
      } else {
        setMessage(response.data.message || 'Thông tin bạn nhập không chính xác');
      }

    } catch (error: any) {
      console.error('Forgot password error:', error.response || error);
      setMessage(error.response?.data?.message || 'Thông tin bạn nhập không chính xác');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.image} 
          resizeMode="contain" 
        />

        <Text style={styles.subHeader}>Quên mật khẩu</Text>

        <View style={styles.formContainer}>
          <View>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={validateEmail}
            />
            {errors.email ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#888"
              value={name}
              onChangeText={handleFullname}
              onBlur={() => setName(name.trim())}
            />
          </View>

          {message ? (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, !isSubmitted && styles.errorMessage]}>
                {message}
              </Text>
              {isSubmitted && password && (
                <View style={styles.passwordContainer}>
                  <Text style={styles.passwordLabel}>Mật khẩu của bạn là:</Text>
                  <Text style={styles.passwordText}>{password}</Text>
                  <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('SignIn')}
                  >
                    <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}

          {!isSubmitted && (
            <TouchableOpacity 
              style={[styles.button, errors.email ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={!!errors.email}
            >
              <Text style={styles.buttonText}>Gửi yêu cầu đặt lại mật khẩu</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  subHeader: {
    fontSize: 25,
    color: 'black',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formContainer: {
    flex: 1,
    marginBottom: 24,
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#181717',
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: 250,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 15,
    alignItems: 'center',
    width: 250,
    marginTop: 30,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageContainer: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  messageText: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
  },
  passwordContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  passwordLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  passwordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: 'red',
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: -10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  }
});

export default ForgetScreen;