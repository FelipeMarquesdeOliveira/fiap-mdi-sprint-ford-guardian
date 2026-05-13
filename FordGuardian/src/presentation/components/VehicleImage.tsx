import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { FORD_COLORS, SPACING } from '../../shared/theme';

interface VehicleImageProps {
  imageUrl?: string;
  model?: string;
  size?: 'small' | 'medium' | 'large';
}

const { width } = Dimensions.get('window');

export const VehicleImage: React.FC<VehicleImageProps> = ({
  imageUrl,
  model,
  size = 'medium',
}) => {
  const dimensions = {
    small: { width: 60, height: 40 },
    medium: { width: width * 0.5, height: 160 },
    large: { width: width * 0.8, height: 200 },
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
      <View style={styles.carSilhouette}>
        <View style={styles.carBody} />
        <View style={styles.carTop} />
        <View style={styles.wheelLeft} />
        <View style={styles.wheelRight} />
      </View>
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
  carSilhouette: {
    alignItems: 'center',
  },
  carBody: {
    width: 80,
    height: 24,
    backgroundColor: FORD_COLORS.FORD_CHARCOAL,
    borderRadius: 4,
  },
  carTop: {
    width: 50,
    height: 20,
    backgroundColor: FORD_COLORS.FORD_CHARCOAL,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: -2,
  },
  wheelLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: FORD_COLORS.FORD_CHARCOAL,
    position: 'absolute',
    bottom: -8,
    left: 12,
  },
  wheelRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: FORD_COLORS.FORD_CHARCOAL,
    position: 'absolute',
    bottom: -8,
    right: 12,
  },
});