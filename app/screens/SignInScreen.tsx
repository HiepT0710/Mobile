import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { apiService } from '../config/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
// import yourImage from '../../assets/images/swe.jpg' // Adjust the path and filename as needed

const SignInScreen = ({ navigation }: { navigation: any }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Thay thế useEffect bằng useFocusEffect
  useFocusEffect(
    useCallback(() => {
      clearLoginInfo();
    }, [])
  );

  const clearLoginInfo = async () => {
    setName('');
    setPassword('');
    try {
      await AsyncStorage.removeItem('loginInfo');
    } catch (error) {
      console.error('Error clearing login info:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (!name || !password) {
        setErrorMessage('Vui lòng nhập đầy đủ thông tin');
        return;
      }

      const response = await apiService.login({
        name: name,
        password: password
      });

      if (response.data.status) {
        // Cấu trúc lại dữ liệu lưu trữ
        const userData = {
          id: response.data.user.id, // Lưu trực tiếp ID
          email: response.data.user.email,
          token: response.data.token,
          user: response.data.user // Lưu thêm thông tin user đầy đủ
        };

        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('loginInfo', JSON.stringify(userData));
        
        Alert.alert('Thành công', 'Đăng nhập thành công');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        setErrorMessage('Thông tin đăng nhập không đúng');
      }

    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Thông tin đăng nhập không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.image} resizeMode="contain" />

      <Text style={styles.subHeader}>Đăng nhập</Text>

      <View style={styles.formContainer}>
        <View>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#888"
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
          />
          {errors.name ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.name}</Text>
            </View>
          ) : null}
        </View>

        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, errors.name ? styles.buttonDisabled : null]}
          onPress={handleSignIn}
          disabled={isLoading || !!errors.name}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng Nhập</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerText}>Đăng ký</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Forget')}>
          <Text style={styles.footerText}>Quên mật khẩu</Text>
        </TouchableOpacity>
      </View>
      {isLoading && <ActivityIndicator size="large" color="#000" />}
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: 300, // Adjust the size as needed
    height: 300, // Adjust the size as needed
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
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
    width:250,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 15,
    alignItems: 'center',
    width: 200,
    marginTop: 30,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  footerText: {
    color: '#181717',
    fontSize: 16,
    marginVertical: 8,
  },
  footerr: {
    color: '#800606',
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // Màu nền nhạt
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  }
});

export default SignInScreen;
