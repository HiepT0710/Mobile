import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiService } from '../config/apiService'; // Đảm bảo import apiService

// Define a type for cart items
type CartItem = {
  id: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  color: string;
  size: string;
};

const DetailsScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { product } = route.params; // Nhận toàn bộ sản phẩm từ params
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Đen'); // Default selected color
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // State for selected size
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Add color options
  const colorOptions = ['Đen', 'Trắng']; // Only black and white

  // Đặt kích thước mặc định
  const sizeOptions = ['21inch', '22inch', '24inch']; // Kích thước cố định

  // Kiểm tra danh mục sản phẩm
  const isMonitorCategory = product.category === 'Màn Hình'; // Kiểm tra danh mục

  const fetchRelatedProducts = async (productId: string) => {
    try {
        const response = await apiService.getRelatedProducts(productId);
        if (response.data.status) {
            setRelatedProducts(response.data.data); // Lưu sản phẩm liên quan vào state
        }
    } catch (error) {
        console.error('Error fetching related products:', error);
    }
};

  useEffect(() => {
    loadCart();
    if (product && product.id) {
        fetchRelatedProducts(product.id); // Gọi hàm với ID của sản phẩm hiện tại
    }
  }, [product]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        setCart(cartData);
        const totalItems = cartData.items.reduce(
          (total: number, item: CartItem) => total + item.quantity, 
          0
        );
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      let currentCart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };

      const newCartItem = {
        id: product.id,
        title: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
      };

      // Kiểm tra xem có mục nào đã tồn tại với ID, màu sắc và kích thước giống nhau không
      const existingItemIndex = currentCart.items.findIndex((item: CartItem) => 
        item.id === newCartItem.id && item.color === newCartItem.color && item.size === newCartItem.size
      );

      if (existingItemIndex >= 0) {
        // Nếu mục đã tồn tại, cập nhật số lượng
        currentCart.items[existingItemIndex].quantity += quantity;
      } else {
        // Nếu mục không tồn tại, thêm vào giỏ hàng
        currentCart.items.push(newCartItem);
      }

      currentCart.total += parseFloat(product.price) * quantity;

      await AsyncStorage.setItem('cart', JSON.stringify(currentCart));
      setCart(currentCart);

      // Cập nhật số lượng giỏ hàng
      const newTotalItems = currentCart.items.reduce(
        (total: number, item: CartItem) => total + item.quantity,
        0
      );
      setCartCount(newTotalItems);

      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  console.log('Product:', product); // Kiểm tra giá trị của product

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Cart', { cart })} 
            style={styles.cartButton}
          >
            <Icon name="cart-outline" size={24} color="black" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Image source={{ uri: product.image }} style={styles.productImage} />

        <View style={styles.productDetails}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand_name}</Text>
          <Text style={styles.productPrice}>{product.price.toLocaleString()} VND</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Icon name="remove-circle-outline" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
              <Icon name="add-circle-outline" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          <View style={styles.colorOptionsContainer}>
            {colorOptions.map((color, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.colorOption, { borderColor: selectedColor === color ? '#4A90E2' : '#ddd' }]} 
                onPress={() => setSelectedColor(color)}
              >
                <View style={[styles.colorCircle, { backgroundColor: color === 'Đen' ? 'black' : 'white' }]} />
                <Text style={{ color: selectedColor === color ? '#4A90E2' : 'black' }}>{color}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.selectedColorText}>Màu đã chọn: {selectedColor}</Text>

          {/* Chỉ hiển thị kích thước nếu danh mục là "Màn Hình" */}
          {isMonitorCategory && sizeOptions.length > 0 && (
            <View style={styles.sizeOptionsContainer}>
              {sizeOptions.map((size, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.sizeOption, { borderColor: selectedSize === size ? '#4A90E2' : '#ddd' }]} 
                  onPress={() => {
                    setSelectedSize(size);
                    console.log('Selected Size:', size);
                  }}
                >
                  <Text style={{ color: selectedSize === size ? '#4A90E2' : 'black' }}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isMonitorCategory && !sizeOptions.length && (
            <Text style={styles.noSizeText}>Không có kích thước nào khả dụng</Text>
          )}

          <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>

        <View>
            <Text style={styles.relatedProductsTitle}>Sản phẩm liên quan</Text>
            <View style={styles.relatedProductsContainer}>
                {relatedProducts.slice(0, 4).map((item, index) => ( // Giới hạn chỉ hiển thị 4 sản phẩm
                    <TouchableOpacity 
                        key={item.id} 
                        onPress={() => navigation.navigate('Detail', { product: item })} // Điều hướng đến chi tiết sản phẩm
                        style={[
                            styles.relatedProductCard,
                            { marginLeft: index % 2 === 0 ? 0 : 10 } // Thêm khoảng cách giữa các cột
                        ]}
                    >
                        <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  productDetails: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    marginVertical: 10,
  },
  addToCartButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  cartButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  colorOption: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  selectedColorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  productBrand: {
    fontSize: 18,
    color: '#777',
    marginBottom: 10,
  },
  sizeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  sizeOption: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedSizeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  noSizeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'red',
  },
  relatedProductsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  relatedProductsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Cho phép các sản phẩm xuống dòng
    justifyContent: 'flex-start', // Bắt đầu từ bên trái
  },
  relatedProductCard: {
    width: '48%', // Mỗi sản phẩm chiếm 48% chiều rộng
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  relatedProductImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    marginBottom: 5,
  },
});


export default DetailsScreen;
