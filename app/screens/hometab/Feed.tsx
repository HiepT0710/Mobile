import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator, ScrollView, SafeAreaView, ImageStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../config/apiService';
import { ProfileImage } from '../../components/ProfileImage';

const { width } = Dimensions.get('window');

export interface ProductDetails {
  id: string;
  name: string;
  title: string;
  price: string;
  rating: { rate: number; count: number };
  category: string;
  image: string;
  colors: { name: string; image: string }[];
  brand: string;
  model: string;
  origin: string;
  material: string;
  size: string;
  description: string;
  introduction: string;
  specifications: { [key: string]: string };
  features: string[];
  warranty: string;
  gifts: string[];
}

const BANNER_DATA = [
  {
    id: '1',
    image: 'https://mygear.vn/media/banner/22_08-61a18fb7554e59c6c84ac7d92f301f6e.jpg',
  },
  {
    id: '2',
    image: 'https://mygear.vn/media/banner/24_09-ba21067d35f9d40aed88e128019db115.jpg',
  },
];

const Feed = ({ navigation }: { navigation: any }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState('Thủ Đức');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const locations = [
    'Quận 1',
    'Quận 2',
    'Quận 3',
    'Quận 4',
    'Quận 5',
    'Thủ Đức',
    'Bình Thạnh',
    'Gò Vấp',
  ];

  // Hàm chuyển đổi tiếng Việt có dấu thành không dấu
  const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Một số bộ ký tự có thể bạn còn quên
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
  };

  // Auto-scroll logic for banners
  useEffect(() => {
    const interval = setInterval(() => {
      if (BANNER_DATA.length > 1) {
        const nextIndex = (currentBannerIndex + 1) % BANNER_DATA.length;
        setCurrentBannerIndex(nextIndex);
        bannerRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0
        });
      }
    }, 3000); // Cuộn mỗi 3 giây

    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim() === '') {
      setFilteredProducts(products);
      return;
    }
    
    const searchLower = removeVietnameseTones(searchKeyword.toLowerCase().trim());
    const filtered = products.filter(item => {
      const name = removeVietnameseTones((item.name || '').toLowerCase());
      const description = removeVietnameseTones((item.description || '').toLowerCase());
      
      // Tìm kiếm theo từ hoặc cụm từ hoàn chỉnh
      const nameWords = name.split(' ');
      const descWords = description.split(' ');
      
      // Kiểm tra xem có từ nào bắt đầu bằng searchLower không
      return nameWords.some(word => word.startsWith(searchLower)) ||
             descWords.some(word => word.startsWith(searchLower)) ||
             name.includes(searchLower) ||
             description.includes(searchLower);
    });
    
    setFilteredProducts(filtered);
  }, [searchKeyword, products]);

  useEffect(() => {
    loadCartCount();
  }, [cart]);

  useEffect(() => {
    loadUserAvatar();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserAvatar();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCartCount = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        const totalItems = cartData.items.reduce((total: number, item: any) => total + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const loadUserAvatar = async () => {
    try {
      const loginInfo = await AsyncStorage.getItem('loginInfo');
      if (loginInfo) {
        const userData = JSON.parse(loginInfo);
        const userId = userData.id || userData.user?.id;
        
        const response = await apiService.getUserProfile(userId);
        if (response.data.status && response.data.data.image) {
          setUserAvatar(response.data.data.image);
        }
      }
    } catch (error) {
      console.error('Error loading user avatar:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        apiService.getCategories(),
        apiService.getProducts()
      ]);

      console.log('Products response:', productsRes.data);

      setCategories(categoriesRes.data.data);
      setProducts(productsRes.data.data);
      setFilteredProducts(productsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    if (selectedCategory === 'All') {
      return filteredProducts;
    }
    return filteredProducts.filter(product => 
      product.category_id.toString() === selectedCategory
    );
  };

  const navigateToDetails = (item: any) => {
    navigation.navigate('Detail', { product: item });
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const addToCart = async (item: any) => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      let currentCart = savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };

      const existingItemIndex = currentCart.items.findIndex(
        (cartItem: any) => cartItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        currentCart.items[existingItemIndex].quantity += 1;
      } else {
        currentCart.items.push({
          id: item.id,
          title: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
          color: item.color || 'Mặc định'
        });
      }

      currentCart.total = currentCart.items.reduce(
        (sum: number, item: any) => sum + (item.price * item.quantity),
        0
      );

      await AsyncStorage.setItem('cart', JSON.stringify(currentCart));
      setCart(currentCart);
      
      const newTotalItems = currentCart.items.reduce(
        (total: number, item: any) => total + item.quantity, 
        0
      );
      setCartCount(newTotalItems);
      
      alert(`Đã thêm "${item.name}" vào giỏ hàng!`);

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`Có lỗi xảy ra khi thêm "${item.name}" vào giỏ hàng`);
    }
  };

  const renderProduct = ({ item }: { item: any }) => {
    return (
        <TouchableOpacity 
            style={styles.productWrapper} 
            onPress={() => navigateToDetails(item)}
        >
            <View style={styles.productCard}>
                <Image
                    source={{ 
                        uri: item.image || 'https://via.placeholder.com/150'
                    }}
                    style={styles.productImage}
                />
                <Text style={styles.productTitle} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.productBottom}>
                    <Text style={styles.productPrice}>
                        {parseInt(item.price).toLocaleString()}đ
                    </Text>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => addToCart(item)}
                    >
                        <Icon name="cart-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

  const renderBannerItem = ({ item }: { item: any }) => (
    <View style={styles.bannerItemContainer}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.bannerImage as ImageStyle} 
        resizeMode="cover"
      />
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
          >
            <Text style={styles.locationText}>Location</Text>
            <View style={styles.locationValueContainer}>
              <Text style={styles.locationValue}>{currentLocation}</Text>
              <Icon name="chevron-down" size={16} color="#666" />
            </View>
          </TouchableOpacity>

          {showLocationPicker && (
            <View style={styles.locationPicker}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={styles.locationItem}
                  onPress={() => {
                    setCurrentLocation(location);
                    setShowLocationPicker(false);
                  }}
                >
                  <Text style={styles.locationItemText}>{location}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.topBarRight}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Cart', { cart: cart })} 
              style={styles.cartButton}
            >
              <Icon name="cart-outline" size={24} color="#000" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToProfile}>
              <ProfileImage
                source={userAvatar}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập tên sản phẩm"
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Main content */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.mainContent}
        >
          {/* Banner */}
          <View style={styles.bannerWrapper}>
            <FlatList
              ref={bannerRef}
              data={BANNER_DATA}
              renderItem={renderBannerItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              decelerationRate="fast"
              getItemLayout={(data, index) => ({
                length: Dimensions.get('window').width - 20,
                offset: (Dimensions.get('window').width - 20) * index,
                index,
              })}
            />
          </View>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categories}
          >
            <TouchableOpacity
              key="all"
              style={[
                styles.categoryButton, 
                selectedCategory === 'All' && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory('All')}
            >
              <Text style={styles.categoryButtonText}>Tất cả</Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id.toString() && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory(category.id.toString())}
              >
                <Text style={styles.categoryButtonText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products */}
          <View style={styles.productsContainer}>
            <FlatList
              data={getFilteredProducts()}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productGrid}
              columnWrapperStyle={styles.productRow}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  mainContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerWrapper: {
    height: 150,
    marginBottom: 15,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  bannerItemContainer: {
    width: width,
    height: 150,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categories: {
    maxHeight: 50,
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth:0.1,
    borderColor:'black'
    
  },
  selectedCategoryButton: {
    backgroundColor: '#EEE9E9',
  },
  categoryButtonText: {
    color: 'black',
    fontSize: 14,
  },
  productsContainer: {
    flex: 1,
    zIndex: 1,
  },
  productGrid: {
    flexGrow: 1, // Cho phép grid mở rộng
  },
  productRow: {
    justifyContent: 'flex-start',
  },
  productWrapper: {
    width: '50%',
    padding: 5,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
    height: 40, // Chiều cao cố định cho title
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
  },
  addToCartButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    zIndex: 9999,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    marginRight: 15,
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
  locationContainer: {
    flexDirection: 'column',
    padding: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#888',
  },
  locationValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationPicker: {
    position: 'absolute',
    top: 60,
    left: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 150,
    zIndex: 9999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  locationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationItemText: {
    fontSize: 14,
    color: '#333',
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius:20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
    padding: 0,
    borderRadius:20,
    // Loại bỏ padding mặc định
  },
});

export default Feed;
