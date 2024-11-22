import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../../config/apiService';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  Feed: { refresh?: boolean } | undefined;
  // ... other screens
};

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

const AdminScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category_id, setCategoryId] = useState('');
  const [brand_id, setBrandId] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await apiService.getBrands();
      setBrands(response.data.data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

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

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: true,
    };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const source = result.assets[0];
      
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
        const base64Image = `data:${fileType};base64,${source.base64}`;
        setImage(base64Image);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setMessage('');

      if (!name || !price || !category_id || !brand_id || !description || !content || !image) {
        setMessage('Vui lòng điền đầy đủ thông tin và chọn ảnh');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category_id', category_id);
      formData.append('brand_id', brand_id);
      formData.append('description', description);
      formData.append('content', content);
      formData.append('status', status);

      // Xử lý ảnh base64
      if (image) {
        formData.append('image', image);
      }

      const response = await apiService.createProduct(formData);

      if (response.data.status) {
        setMessage('Tạo sản phẩm thành công');
        // Reset form
        setName('');
        setPrice('');
        setDescription('');
        setContent('');
        setCategoryId('');
        setBrandId('');
        setImage(null);
        
        // Refresh product list in Feed screen
        navigation.navigate('Feed', { refresh: true });
      } else {
        setMessage(response.data.message || 'Tạo sản phẩm thất bại');
      }
    } catch (error: any) {
      console.error('Create product error:', error);
      setMessage(error.response?.data?.message || 'Tạo sản phẩm thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quản lý Hệ thống</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('CategoryManagement')}
        >
          <Icon name="list-outline" size={24} color="#fff" />
          <Text style={styles.menuButtonText}>Quản lý Danh mục</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Icon name="people-outline" size={24} color="#fff" />
          <Text style={styles.menuButtonText}>Quản lý Người dùng</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên sản phẩm"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Giá"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Picker
          selectedValue={category_id}
          onValueChange={(itemValue) => setCategoryId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Chọn danh mục" value="" />
          {categories.map((category) => (
            <Picker.Item
              key={category.id}
              label={category.name}
              value={category.id.toString()}
            />
          ))}
        </Picker>

        <Picker
          selectedValue={brand_id}
          onValueChange={(itemValue) => setBrandId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Chọn thương hiệu" value="" />
          {brands.map((brand) => (
            <Picker.Item
              key={brand.id}
              label={brand.name}
              value={brand.id.toString()}
            />
          ))}
        </Picker>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mô tả"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nội dung"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Chọn ảnh</Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image }} style={styles.previewImage} />
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tạo Sản Phẩm</Text>
          )}
        </TouchableOpacity>

        {message ? (
          <Text style={[styles.message, message.includes('thành công') ? styles.successMessage : styles.errorMessage]}>
            {message}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  picker: {
    height: 50,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
  },
  imageButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  menuButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AdminScreen;
