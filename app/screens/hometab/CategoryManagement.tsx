import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiService } from '../../config/apiService';

interface Category {
  id: number;
  name: string;
  status: number;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      if (response.data.status) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.createCategory({
        name: newCategoryName,
        status: 1
      });

      if (response.data.status) {
        Alert.alert('Thành công', 'Thêm danh mục thành công');
        setNewCategoryName('');
        loadCategories();
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không thể thêm danh mục');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Lỗi', 'Không thể thêm danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (category: Category) => {
    setEditingCategory(category);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      setLoading(true);
      const response = await apiService.updateCategory(editingCategory.id, {
        name: editingCategory.name,
        status: editingCategory.status
      });

      if (response.data.status) {
        Alert.alert('Thành công', 'Cập nhật danh mục thành công');
        setEditingCategory(null);
        loadCategories();
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không thể cập nhật danh mục');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa danh mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.deleteCategory(id);
              if (response.data.status) {
                Alert.alert('Thành công', 'Xóa danh mục thành công');
                loadCategories();
              } else {
                Alert.alert('Lỗi', response.data.message || 'Không thể xóa danh mục');
              }
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Lỗi', 'Không thể xóa danh mục');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quản lý Danh mục</Text>

      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên danh mục mới"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCategory}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator style={styles.loading} />}

      <View style={styles.listContainer}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            {editingCategory?.id === category.id ? (
              <TextInput
                style={styles.editInput}
                value={editingCategory.name}
                onChangeText={(text) => 
                  setEditingCategory({...editingCategory, name: text})
                }
              />
            ) : (
              <Text style={styles.categoryName}>{category.name}</Text>
            )}
            
            <View style={styles.actionButtons}>
              {editingCategory?.id === category.id ? (
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleUpdateCategory}
                >
                  <Icon name="checkmark-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditCategory(category)}
                >
                  <Icon name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteCategory(category.id)}
              >
                <Icon name="trash-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  addContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loading: {
    marginVertical: 20,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
});

export default CategoryManagement;