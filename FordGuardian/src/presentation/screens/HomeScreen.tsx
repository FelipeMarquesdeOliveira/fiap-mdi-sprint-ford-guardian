import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { vehicleRepository } from '../../data/repositories';
import { alertRepository } from '../../data/repositories';
import { Vehicle } from '../../domain/entities/Vehicle';
import { Alert } from '../../domain/entities/Alert';
import { FORD_COLORS } from '../../shared/theme';
import { ROUTES, HEALTH_STATUS_LABELS, getVehicleImage, FORD_LOGO } from '../../shared/constants';
import { LoadingSpinner } from '../components';

const { width } = Dimensions.get('window');
const CAR_IMAGE_WIDTH = Math.min(width - 60, 900);

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const getStatusColor = (status: Vehicle['healthStatus']) => {
  switch (status) {
    case 'normal': return FORD_COLORS.HEALTH_NORMAL;
    case 'attention': return FORD_COLORS.HEALTH_ATTENTION;
    case 'critical': return FORD_COLORS.HEALTH_CRITICAL;
    default: return FORD_COLORS.DARK_GRAY;
  }
};

const getHealthPercent = (status: Vehicle['healthStatus']) => {
  switch (status) {
    case 'normal': return 85;
    case 'attention': return 55;
    case 'critical': return 25;
    default: return 0;
  }
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!loading && vehicles.length > 0) {
      Animated.stagger(120, [
        Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.spring(contentAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [loading, vehicles]);

  const loadData = async () => {
    try {
      const vehiclesData = await vehicleRepository.getAll();
      const alertsData = await alertRepository.getAll();
      setVehicles(vehiclesData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchVehicle = useCallback((direction: 'left' | 'right') => {
    if (vehicles.length <= 1) return;

    const exitValue = direction === 'right' ? -40 : 40;
    const enterValue = direction === 'right' ? 40 : -40;

    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: exitValue,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change index
      setCurrentIndex((prev) => {
        if (direction === 'right') return prev === vehicles.length - 1 ? 0 : prev + 1;
        return prev === 0 ? vehicles.length - 1 : prev - 1;
      });

      // Set starting position for enter animation
      slideAnim.setValue(enterValue);

      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [vehicles.length, slideAnim, fadeAnim, scaleAnim]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (vehicles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image source={FORD_LOGO} style={styles.emptyLogo} resizeMode="contain" />
        <Text style={styles.emptyTitle}>Nenhum veículo cadastrado</Text>
        <Text style={styles.emptySubtitle}>Adicione seu primeiro veículo Ford</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate(ROUTES.ADD_VEHICLE)}>
          <Text style={styles.emptyButtonText}>Adicionar Veículo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentVehicle = vehicles[currentIndex];
  const vehicleAlerts = alerts.filter(a => a.vehicleId === currentVehicle?.id && !a.isDismissed);
  const currentAlert = vehicleAlerts[0];
  const statusColor = getStatusColor(currentVehicle.healthStatus);
  const healthPercent = getHealthPercent(currentVehicle.healthStatus);

  return (
    <View style={styles.container}>
      {/* Header — Ford Logo centered + add button */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}>
        <View style={styles.headerLeft}>
          <Image source={FORD_LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.guardianLabel}>Guardian</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate(ROUTES.ADD_VEHICLE)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={18} color={FORD_COLORS.FORD_BLUE} />
        </TouchableOpacity>
      </Animated.View>

      {/* Main content */}
      <Animated.View style={[
        styles.mainContent,
        {
          opacity: contentAnim,
          transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}>


        {/* Car carousel area */}
        <View style={styles.carouselArea}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => switchVehicle('left')}
            disabled={vehicles.length <= 1}
            activeOpacity={0.5}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={32}
              color={vehicles.length <= 1 ? '#D0D0D0' : FORD_COLORS.FORD_BLUE}
            />
          </TouchableOpacity>

          <Animated.View style={[
            styles.carCenter,
            {
              opacity: fadeAnim,
              transform: [
                { translateX: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: currentVehicle.id })}
              activeOpacity={0.8}
            >
              <Image
                source={getVehicleImage(currentVehicle.model)}
                style={styles.carImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => switchVehicle('right')}
            disabled={vehicles.length <= 1}
            activeOpacity={0.5}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={32}
              color={vehicles.length <= 1 ? '#D0D0D0' : FORD_COLORS.FORD_BLUE}
            />
          </TouchableOpacity>
        </View>

        {/* Vehicle info below car */}
        <Animated.View style={[
          styles.vehicleInfo,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
          <Text style={styles.vehicleName}>{currentVehicle.model}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{currentVehicle.year}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{currentVehicle.licensePlate}</Text>
            <View style={styles.metaDot} />
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {HEALTH_STATUS_LABELS[currentVehicle.healthStatus]}
            </Text>
          </View>

          {/* Health bar */}
          <View style={styles.healthBar}>
            <View style={styles.healthTrack}>
              <View style={[styles.healthFill, { width: `${healthPercent}%`, backgroundColor: statusColor }]} />
            </View>
            <Text style={styles.healthPercent}>{healthPercent}%</Text>
          </View>
        </Animated.View>

        {/* Page dots */}
        {vehicles.length > 1 && (
          <View style={styles.pageDots}>
            {vehicles.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === currentIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* CTA button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: currentVehicle.id })}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Ver Detalhes do Veículo</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={FORD_COLORS.WHITE} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 72,
    height: 28,
  },
  guardianLabel: {
    fontSize: 14,
    fontWeight: '300',
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: 2,
    marginLeft: 8,
    opacity: 0.6,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: FORD_COLORS.FORD_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main content
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Alert pill
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderLeftWidth: 3,
    marginTop: 8,
    marginBottom: 4,
  },
  alertDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  alertPillText: {
    flex: 1,
    fontSize: 13,
    color: FORD_COLORS.FORD_CHARCOAL,
    fontWeight: '500',
  },

  // Carousel
  carouselArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carImage: {
    width: CAR_IMAGE_WIDTH,
    height: CAR_IMAGE_WIDTH * 0.55,
  },

  // Vehicle info
  vehicleInfo: {
    paddingBottom: 8,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: FORD_COLORS.MEDIUM_GRAY,
    marginHorizontal: 8,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Health bar
  healthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  healthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#ECECEC',
    borderRadius: 2,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 2,
  },
  healthPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: FORD_COLORS.DARK_GRAY,
    width: 32,
    textAlign: 'right',
  },

  // Page dots
  pageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8D8D8',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    width: 18,
  },

  // CTA button
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  ctaText: {
    color: FORD_COLORS.WHITE,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: FORD_COLORS.WHITE,
  },
  emptyLogo: {
    width: 100,
    height: 40,
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: 28,
  },
  emptyButton: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: FORD_COLORS.WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
});