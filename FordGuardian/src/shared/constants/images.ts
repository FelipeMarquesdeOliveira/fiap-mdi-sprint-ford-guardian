import { ImageSourcePropType, Platform } from 'react-native';

// Local Ford vehicle images - bundled with the app
// These use require() which works in both native and web via Metro bundler

const mustangImage = require('../../../assets/images/mustang_gt.png');
const broncoImage = require('../../../assets/images/bronco_sport.png');
const rangerImage = require('../../../assets/images/ranger.png');
const fordLogoImage = require('../../../assets/images/ford_logo.png');

export const VEHICLE_IMAGES: Record<string, ImageSourcePropType> = {
  'Mustang GT': mustangImage,
  'Bronco Sport': broncoImage,
  'Ranger': rangerImage,
};

export const FORD_LOGO: ImageSourcePropType = fordLogoImage;

export const getVehicleImage = (model: string): ImageSourcePropType => {
  // Try exact match first
  if (VEHICLE_IMAGES[model]) {
    return VEHICLE_IMAGES[model];
  }
  // Try partial match
  const lowerModel = model.toLowerCase();
  for (const [key, value] of Object.entries(VEHICLE_IMAGES)) {
    if (lowerModel.includes(key.toLowerCase())) {
      return value;
    }
  }
  // Default to Mustang
  return VEHICLE_IMAGES['Mustang GT'];
};
