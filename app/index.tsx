import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import Feed from '../app/screens/hometab/Feed';
import Cart from '../app/screens/hometab/Cart';
import ForgetScreen from './screens/ForgetScreen';
import UserDetailsScreen from './screens/UserDetailsScreen';
import UpdateProfile from './screens/UpdateProfile';
import ChangePassword from './screens/ChangePassword';
import AdminScreen from './screens/hometab/admin';
import CategoryManagement from './screens/hometab/CategoryManagement';
import UserManagement from './screens/hometab/UserManagement';

const Stack = createNativeStackNavigator();

const MyApp = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
         name="Home" 
         component={HomeScreen}
         options={{ headerShown: false }}
        />
        <Stack.Screen
         name="Detail" 
         component={DetailsScreen}
         options={{ headerShown: false }} 
        />
        <Stack.Screen
         name="SignIn" 
         component={SignInScreen}
         options={{ headerShown: false }} 
        />
        <Stack.Screen
         name="SignUp" 
         component={SignUpScreen}
         options={{ headerShown: false }} 
        />
        <Stack.Screen
         name="Feed"
         component={Feed}
         options={{ headerShown: false }}
        />
        <Stack.Screen
         name="Cart"
         component={Cart}
         options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Forget" 
          component={ForgetScreen} 
        />
        <Stack.Screen
         name="UserDetailsScreen"
         component={UserDetailsScreen}
         options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UpdateProfile"
          component={UpdateProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: 'Quản lý sản phẩm',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
            headerTintColor: '#333',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="CategoryManagement"
          component={CategoryManagement}
          options={{
            title: 'Quản lý danh mục',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
            headerTintColor: '#333',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="UserManagement"
          component={UserManagement}
          options={{
            title: 'Quản lý người dùng',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
            headerTintColor: '#333',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MyApp;
