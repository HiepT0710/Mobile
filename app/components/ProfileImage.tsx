import React, { useState } from 'react';
import { View, Image, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../config/apiService';

interface ProfileImageProps {
  source: string | null;
  style: any;
}

export const ProfileImage = ({ source, style }: ProfileImageProps) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const getImageSource = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    // Nếu đã là URL đầy đủ
    if (imageUrl.startsWith('http')) {
      return { uri: imageUrl };
    }

    // Nếu là tên file, thêm domain của backend
    return { uri: `${BASE_URL}/images/avatar/${imageUrl}` };
  };

  if (!source || error) {
    return (
      <View style={[style, styles.placeholderContainer]}>
        <Icon 
          name="person-circle-outline" 
          size={style.width || 35} 
          color="#666"
        />
      </View>
    );
  }

  return (
    <View style={[style, styles.imageWrapper]}>
      {loading && (
        <View style={[style, styles.loadingContainer]}>
          <ActivityIndicator size="small" color="#0066cc" />
        </View>
      )}
      <Image
        source={getImageSource(source)}
        style={[style, styles.profileImage]}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          console.error('Image loading error for source:', source);
          setError(true);
          setLoading(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 