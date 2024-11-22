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
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../../config/apiService';

interface User {
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

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      if (response.data.status) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await apiService.getRoles();
      if (response.data.status) {
        const fetchedRoles = response.data.data.map((role: string) => ({
          label: role.charAt(0).toUpperCase() + role.slice(1),
          value: role,
        }));
        setRoles(fetchedRoles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách vai trò');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);
      const response = await apiService.updateUser(editingUser.id, editingUser);

      if (response.data.status) {
        Alert.alert('Thành công', 'Cập nhật người dùng thành công');
        setEditingUser(null);
        loadUsers();
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không thể cập nhật người dùng');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa người dùng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.deleteUser(id);
              if (response.data.status) {
                Alert.alert('Thành công', 'Xóa người dùng thành công');
                loadUsers();
              } else {
                Alert.alert('Lỗi', response.data.message || 'Không thể xóa người dùng');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Lỗi', 'Không thể xóa người dùng');
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
      <Text style={styles.title}>Quản lý Người dùng</Text>

      {loading && <ActivityIndicator style={styles.loading} />}

      <View style={styles.listContainer}>
        {users.map((user) => (
          <View key={user.id} style={styles.userItem}>
            {editingUser?.id === user.id ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.editInput}
                  value={editingUser.name}
                  onChangeText={(text) => 
                    setEditingUser({...editingUser, name: text})
                  }
                  placeholder="Tên"
                />
                <TextInput
                  style={styles.editInput}
                  value={editingUser.email}
                  onChangeText={(text) => 
                    setEditingUser({...editingUser, email: text})
                  }
                  placeholder="Email"
                />
                <TextInput
                  style={styles.editInput}
                  value={editingUser.phone}
                  onChangeText={(text) => 
                    setEditingUser({...editingUser, phone: text})
                  }
                  placeholder="Số điện thoại"
                />
                <Picker
                  selectedValue={editingUser.roles}
                  onValueChange={(itemValue) => 
                    setEditingUser({...editingUser, roles: itemValue as 'admin' | 'customer'})
                  }
                  style={styles.picker}
                >
                  {roles.map((role) => (
                    <Picker.Item key={role.value} label={role.label} value={role.value} />
                  ))}
                </Picker>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleUpdateUser}
                >
                  <Text style={styles.buttonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                  <Text style={styles.userRole}>
                    {user.roles === 'admin' ? 'Quản trị' : 'Khách hàng'}
                  </Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditUser(user)}
                  >
                    <Icon name="create-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteUser(user.id)}
                  >
                    <Icon name="trash-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  loading: {
    marginVertical: 20,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
  },
  userRole: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  editForm: {
    marginBottom: 10,
  },
  editInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  picker: {
    height: 40,
    marginBottom: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserManagement;