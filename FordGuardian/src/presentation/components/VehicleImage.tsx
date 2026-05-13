import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FORD_COLORS, SPACING } from '../../shared/theme';

interface VehicleImageProps {
  imageUrl?: string;
  model?: string;
  size?: 'small' | 'medium' | 'large';
}

export const VehicleImage: React.FC<VehicleImageProps> = ({
  imageUrl,
  model,
  size = 'medium',
}) => {
  const dimensions = {
    small: { width: 60, height: 40 },
    medium: { width: 160, height: 100 },
    large: { width: 200, height: 140 },
  };

  const { width: imgWidth, height: imgHeight } = dimensions[size];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: imgWidth, height: imgHeight }]}
        resizeMode="contain"
      />
    );
  }

  return (
    <View style={[styles.placeholder, { width: imgWidth, height: imgHeight }]}>
      <MaterialCommunityIcons
        name="car-sports"
        size={imgHeight * 0.5}
        color={FORD_COLORS.FORD_BLUE}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});