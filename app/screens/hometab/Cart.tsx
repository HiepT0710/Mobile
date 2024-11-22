import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';

type CartItem = {
  id: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  color: string;
  size: string;
};

type PaymentForm = {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
};

const Cart = ({ navigation }: { navigation: any }) => {
  const [cart, setCart] = useState<{ items: CartItem[]; total: number }>({ items: [], total: 0 });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [phoneNumber, setPhoneNumber] = useState('');

  const MOMO_INFO = {
    phoneNumber: "0123456789",
    name: "NGUYEN VAN A",
    content: "Thanh toan don hang", // Nội dung chuyển khoản
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (newCart: any) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9]/g, '')) 
        : item.price;

      return sum + price * item.quantity;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const newCart = {
      ...cart,
      items: cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    };
    newCart.total = calculateTotal(newCart.items);
    setCart(newCart);
    saveCart(newCart);
  };

  const removeItem = (itemId: string, itemColor: string, itemSize: string) => {
    const newCart = {
      ...cart,
      items: cart.items.filter((item) => 
        !(item.id === itemId && item.color === itemColor && item.size === itemSize)
      ),
    };
    newCart.total = calculateTotal(newCart.items);
    setCart(newCart);
    saveCart(newCart);
  };

  const handleNormalCheckout = () => {
    // Xóa giỏ hàng
    const newCart = { items: [], total: 0 };
    setCart(newCart);
    saveCart(newCart);
    
    alert('Thanh toán thành công!'); // Hiển thị thông báo thanh toán thành công
  };

  const handleOnlineCheckout = () => {
    setShowPaymentModal(true);
  };

  const requestSMSPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: "Quyền gửi SMS",
            message: "Ứng dụng cần quyền gửi SMS để thông báo thanh toán",
            buttonNeutral: "Hỏi lại sau",
            buttonNegative: "Từ chối",
            buttonPositive: "Đồng ý"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const sendPaymentConfirmationSMS = async (phoneNumber: string, amount: number) => {
    const currentDate = new Date().toLocaleString('vi-VN');
    const messageBody = 
        `THANH TOAN THANH CONG\n` +
        `Thoi gian: ${currentDate}\n` +
        `So tien: ${formatCurrency(amount)}\n` +
        `Phuong thuc: ${selectedPaymentMethod === 'card' ? 'The tin dung' : 
                      selectedPaymentMethod === 'momo' ? 'Vi MoMo' : 
                      selectedPaymentMethod === 'vnpay' ? 'VNPay' : 
                      'Thanh toan online'}\n` +
        `Ma GD: ${Math.random().toString(36).substr(2, 10).toUpperCase()}\n` +
        `Cam on quy khach da su dung dich vu!`;

    // Hiển thị thông tin như một alert hoặc modal
    alert(`Tin nhắn xác nhận sẽ được gửi đến ${phoneNumber}:\n\n${messageBody}`);
    return true;
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán!');
      return;
    }

    if (!phoneNumber) {
      alert('Vui lòng nhập số điện thoại để nhận thông báo!');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      if (!paymentForm.cardNumber || !paymentForm.cardHolder || !paymentForm.expiryDate || !paymentForm.cvv) {
        alert('Vui lòng điền đầy đủ thông tin thẻ!');
        return;
      }
      if (paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Số thẻ không hợp lệ!');
        return;
      }
    }

    try {
      // Giả lập xử lý thanh toán
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gửi SMS xác nhận
      await sendPaymentConfirmationSMS(phoneNumber, cart.total);
      
      alert('Thanh toán thành công!');
      setShowPaymentModal(false);
      
      // Clear cart after successful payment
      const newCart = { items: [], total: 0 };
      setCart(newCart);
      saveCart(newCart);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Có lỗi xảy ra trong quá trình thanh toán!');
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{formatCurrency(item.price)} </Text>
        <Text style={styles.color}>
          Màu: <Text style={{ color: item.color.toLowerCase() }}>{item.color}</Text>
        </Text>
        <Text style={styles.size}>
          Kích thước: <Text style={{ color: '#666666' }}>{item.size}</Text>
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
            <Icon name="remove-circle-outline" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <Icon name="add-circle-outline" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id, item.color, item.size)}>
        <Text style={styles.removeButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  const sendPaymentNotification = async (amount: number) => {
    // Số điện thoại cố định của bạn
    const YOUR_PHONE = "0764650539"; 
    const currentDate = new Date().toLocaleString('vi-VN');
    const messageBody = 
        `THANH TOAN THANH CONG\n` +
        `Thoi gian: ${currentDate}\n` +
        `So tien: ${formatCurrency(amount)}\n` +
        `Phuong thuc: ${selectedPaymentMethod === 'card' ? 'The tin dung' : 
                      selectedPaymentMethod === 'momo' ? 'Vi MoMo' : 
                      selectedPaymentMethod === 'vnpay' ? 'VNPay' : 
                      'Thanh toan online'}\n` +
        `Ma GD: ${Math.random().toString(36).substr(2, 10).toUpperCase()}`;

    // Gửi email thông báo
    const emailData = {
        to: 'hieptran20042004@gmail.com',
        subject: 'Thông báo thanh toán',
        text: messageBody
    };

    try {
        // Gọi API của bạn để gửi email
        const response = await fetch('YOUR_API_ENDPOINT/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }

        // Hiển thị thông báo cho người dùng
        alert(`Giao dịch thành công!\nThông báo đã được gửi đến ${YOUR_PHONE}`);
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('Không thể gửi thông báo');
        return false;
    }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
            <Icon name="home" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cartTitle}>Giỏ hàng của bạn</Text>
      </View>
      {cart.items.length > 0 ? (
        <>
          <FlatList 
            data={cart.items} 
            renderItem={renderItem} 
            keyExtractor={(item) => `${item.id}-${item.color}-${item.size}`}
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng tiền:</Text>
            <Text style={styles.totalPrice}>{formatCurrency(cart.total)}</Text>
          </View>
          <View style={styles.checkoutContainer}>
            <TouchableOpacity 
              style={[styles.checkoutButton, { backgroundColor: '#4A90E2' }]} 
              onPress={handleNormalCheckout}
            >
              <Text style={styles.checkoutButtonText}>Thanh toán thường</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.checkoutButton, { backgroundColor: '#34C759' }]} 
              onPress={handleOnlineCheckout}
            >
              <Text style={styles.checkoutButtonText}>Thanh toán online</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyCartContainer}>
          <Icon name="cart-outline" size={100} color="#CCCCCC" />
          <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
          <TouchableOpacity style={styles.continueShopping} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'momo' && styles.selectedPaymentOption
                ]}
                onPress={() => setSelectedPaymentMethod('momo')}
              >
                <Text style={styles.paymentOptionText}>Momo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'vnpay' && styles.selectedPaymentOption
                ]}
                onPress={() => setSelectedPaymentMethod('vnpay')}
              >
                <Text style={styles.paymentOptionText}>VNPay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === 'card' && styles.selectedPaymentOption
                ]}
                onPress={() => setSelectedPaymentMethod('card')}
              >
                <Text style={styles.paymentOptionText}>Thẻ tín dụng/ghi nợ</Text>
              </TouchableOpacity>

              {selectedPaymentMethod === 'card' && (
                <View style={styles.cardForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Số thẻ"
                    value={paymentForm.cardNumber}
                    onChangeText={(text) => setPaymentForm({...paymentForm, cardNumber: text})}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tên chủ thẻ"
                    value={paymentForm.cardHolder}
                    onChangeText={(text) => setPaymentForm({...paymentForm, cardHolder: text})}
                  />
                  <View style={styles.cardRow}>
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="MM/YY"
                      value={paymentForm.expiryDate}
                      onChangeText={(text) => setPaymentForm({...paymentForm, expiryDate: text})}
                      maxLength={5}
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="CVV"
                      value={paymentForm.cvv}
                      onChangeText={(text) => setPaymentForm({...paymentForm, cvv: text})}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại nhận thông báo"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              )}
              {selectedPaymentMethod === 'momo' && (
                <View style={styles.momoContainer}>
                  <View style={styles.qrContainer}>
                    <QRCode
                      value={`2|99|${MOMO_INFO.phoneNumber}|${MOMO_INFO.name}|${MOMO_INFO.content}|0|0|${cart.total}`}
                      size={200}
                    />
                  </View>
                  <View style={styles.momoInfo}>
                    <Text style={styles.momoInfoText}>Thông tin chuyển khoản:</Text>
                    <Text style={styles.momoInfoDetail}>Số điện thoại: {MOMO_INFO.phoneNumber}</Text>
                    <Text style={styles.momoInfoDetail}>Tên: {MOMO_INFO.name}</Text>
                    <Text style={styles.momoInfoDetail}>Số tiền: {formatCurrency(cart.total)}</Text>
                    <Text style={styles.momoInfoDetail}>Nội dung: {MOMO_INFO.content}</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại nhận thông báo"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <Text style={styles.momoNote}>
                    Quét mã QR bằng ứng dụng Momo để thanh toán
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>Thanh toán {formatCurrency(cart.total)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconButton: {
    padding: 8,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  color: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  size: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  checkoutButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
  },
  continueShopping: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  checkoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    paddingHorizontal: 8,
    gap: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentOption: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  selectedPaymentOption: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F8FF',
  },
  paymentOptionText: {
    fontSize: 16,
  },
  cardForm: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  payButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  momoContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  momoInfo: {
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  momoInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  momoInfoDetail: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
  },
  momoNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
  },
});

export default Cart;
