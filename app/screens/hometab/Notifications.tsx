import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'

const notificationsData = [
  { id: '1', message: 'Bạn có một thông báo mới!' },
  { id: '2', message: 'Đã có cập nhật mới cho ứng dụng.' },
  { id: '3', message: 'Bạn đã nhận được một tin nhắn.' },
];

const Notifications = () => {
  const renderItem = ({ item }: { item: { id: string; message: string } }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notificationsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 40,
        marginBottom: 20,
        color: '#333',
    },
    notificationItem: {
        backgroundColor: '#fff',
        padding: 20,
        marginVertical: 10,
        borderRadius: 10,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationText: {
        fontSize: 18,
        color: '#555',
    },
});
