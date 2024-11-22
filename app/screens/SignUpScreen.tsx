import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { apiService } from '../config/apiService';
// import yourImage from '@/assets/images/swe.jpg'; // Adjust the path and filename as needed

const SignUpScreen = ({ navigation }: { navigation: any }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullname, setFullname] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !text.includes('@')) {
      setErrors(prev => ({...prev, email: 'Email phải chứa ký tự @'}));
    } else {
      setErrors(prev => ({...prev, email: ''}));
    }
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    if (text.length > 0 && text.length < 6) {
      setErrors(prev => ({...prev, password: 'Mật khẩu phải có ít nhất 6 ký tự'}));
    } else {
      setErrors(prev => ({...prev, password: ''}));
    }
  };

  const validateName = (text: string) => {
    setName(text);
    if (text.length > 0 && text.length < 3) {
      setErrors(prev => ({...prev, name: 'Tên đăng nhập phải có ít nhất 3 ký tự'}));
    } else {
      setErrors(prev => ({...prev, name: ''}));
    }
  };

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      setMessage('');
      
      if (!name || !email || !password || !phone || !fullname) {
        setMessage('Vui lòng điền đầy đủ thông tin');
        setIsLoading(false);
        return;
      }

      if (name.length < 3) {
        setMessage('Tên đăng nhập phải có ít nhất 3 ký tự');
        setIsLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setMessage('Email không hợp lệ');
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setMessage('Mật khẩu phải có ít nhất 6 ký tự');
        setIsLoading(false);
        return;
      }

      if (phone.length < 10) {
        setMessage('Số điện thoại không hợp lệ');
        setIsLoading(false);
        return;
      }

      const requestData = {
        name: name.trim(),
        fullname: fullname.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
        address: "",
        gender: "nam",
        status: 1,
        roles: 1
      };

      console.log('Sending data:', requestData);

      const response = await apiService.register(requestData);
      console.log('Register response:', response);

      if (response.data.status) {
        setSuccessMessage('Đăng ký thành công!');
        setTimeout(() => {
          navigation.navigate('SignIn');
        }, 1500);
      } else {
        setMessage(response.data.message || 'Đăng ký thất bại');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setMessage('Kết nối tới server quá lâu. Vui lòng thử lại.');
      } else if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage('Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.subHeader}>Vui lòng nhập đầy đủ thông tin</Text>

      {message ? (
        <View style={styles.messageContainer}>
          <Text style={[
            styles.messageText, 
            message === 'Đăng ký thành công' ? styles.successMessage : styles.errorMessage
          ]}>
            {message}
          </Text>
        </View>
      ) : null}

      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          placeholder="Tên đăng nhập"
          value={name}
          onChangeText={validateName}
          autoCapitalize="none"
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        <View>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="Email"
            value={email}
            onChangeText={validateEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onEndEditing={() => console.log('Email:', email)}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>
        <View>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={validatePassword}
            secureTextEntry
            onEndEditing={() => console.log('Password:', password)}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          onEndEditing={() => console.log('Phone:', phone)}
        />
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          value={fullname}
          onChangeText={setFullname}
          autoCapitalize="words"
        />

        {successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[
            styles.button, 
            styles.buttonEnabled,
            (errors.email || errors.password) ? styles.buttonDisabled : null
          ]} 
          onPress={handleSignUp}
          disabled={!!errors.email || !!errors.password}
        >
          <Text style={styles.buttonText}>Đăng Ký</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.footerText}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
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
  logo: {
    width: 300, // Adjust the size as needed
    height: 300, // Adjust the size as needed
    alignSelf: 'center',
    marginBottom: 24,
  },
  subHeader: {
    fontSize: 20,
    color: '#383838',
    marginBottom: 24,
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
    backgroundColor: '#181717',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonEnabled: {
    opacity: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#181717',
    fontSize: 16,
    marginVertical: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
  },
  errorMessage: {
    color: 'red',
  },
  successContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.1)', // Màu nền nhạt
    borderRadius: 5,
  },
  successText: {
    color: 'green',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SignUpScreen;
