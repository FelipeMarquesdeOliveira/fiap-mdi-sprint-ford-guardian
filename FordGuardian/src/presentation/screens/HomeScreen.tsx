import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { vehicleRepository } from '../../data/repositories';
import { alertRepository } from '../../data/repositories';
import { Vehicle } from '../../domain/entities/Vehicle';
import { Alert } from '../../domain/entities/Alert';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES, HEALTH_STATUS_LABELS } from '../../shared/constants';
import { LoadingSpinner } from '../components';

const { width } = Dimensions.get('window');

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

const getAlertIcon = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical': return 'alert-circle';
    case 'high': return 'alert';
    case 'moderate': return 'information';
    case 'low': return 'check-circle';
    default: return 'information';
  }
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadData();
  }, []);

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

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    callback();
  };

  const handlePrevVehicle = () => {
    if (vehicles.length <= 1) return;
    animateTransition(() => {
      setCurrentIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
    });
  };

  const handleNextVehicle = () => {
    if (vehicles.length <= 1) return;
    animateTransition(() => {
      setCurrentIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
    });
  };

  const currentVehicle = vehicles[currentIndex];
  const vehicleAlerts = alerts.filter(a => a.vehicleId === currentVehicle?.id && !a.isDismissed);
  const currentAlert = vehicleAlerts[0];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <MaterialCommunityIcons name="alpha-f-circle" size={28} color={FORD_COLORS.FORD_BLUE} />
          <Text style={styles.brandText}>FORD GUARDIAN</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate(ROUTES.ADD_VEHICLE)}
        >
          <MaterialCommunityIcons name="plus" size={18} color={FORD_COLORS.WHITE} />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCarIcon}>
            <MaterialCommunityIcons name="car-off" size={64} color={FORD_COLORS.MEDIUM_GRAY} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum veículo</Text>
          <Text style={styles.emptySubtitle}>Adicione seu primeiro veículo Ford</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => navigation.navigate(ROUTES.ADD_VEHICLE)}
          >
            <Text style={styles.emptyAddButtonText}>Adicionar Veículo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevVehicle}
            disabled={vehicles.length <= 1}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={32}
              color={vehicles.length <= 1 ? FORD_COLORS.MEDIUM_GRAY : FORD_COLORS.FORD_BLUE}
            />
          </TouchableOpacity>

          <Animated.View style={[styles.carCard, { opacity: fadeAnim }]}>
            <View style={styles.carImageContainer}>
              <View style={styles.carPlaceholder}>
                <MaterialCommunityIcons name="car-sports" size={120} color={FORD_COLORS.FORD_LIGHT_BLUE} />
              </View>

              {currentAlert && (
                <View style={styles.alertBadge}>
                  <MaterialCommunityIcons
                    name={getAlertIcon(currentAlert.severity) as any}
                    size={14}
                    color={getStatusColor(currentVehicle.healthStatus)}
                  />
                  <Text style={styles.alertText} numberOfLines={1}>
                    {currentAlert.title}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.carInfo}>
              <Text style={styles.carName}>{currentVehicle.model}</Text>
              <View style={styles.carDetails}>
                <Text style={styles.carPlate}>{currentVehicle.licensePlate}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(currentVehicle.healthStatus) }]} />
                <Text style={styles.statusLabel}>{HEALTH_STATUS_LABELS[currentVehicle.healthStatus]}</Text>
              </View>
            </View>

            <View style={styles.healthBar}>
              <View
                style={[
                  styles.healthProgress,
                  {
                    width: `${currentVehicle.healthStatus === 'normal' ? 85 : currentVehicle.healthStatus === 'attention' ? 55 : 25}%`,
                    backgroundColor: getStatusColor(currentVehicle.healthStatus),
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: currentVehicle.id })}
            >
              <Text style={styles.detailsButtonText}>Ver detalhes</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={FORD_COLORS.FORD_BLUE} />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextVehicle}
            disabled={vehicles.length <= 1}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={32}
              color={vehicles.length <= 1 ? FORD_COLORS.MEDIUM_GRAY : FORD_COLORS.FORD_BLUE}
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => navigation.navigate(ROUTES.ALERTS)}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color={FORD_COLORS.FORD_BLUE} />
          <Text style={styles.alertButtonText}>Alertas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dealerButton}
          onPress={() => navigation.navigate(ROUTES.FIND_DEALER)}
        >
          <MaterialCommunityIcons name="map-marker-outline" size={24} color={FORD_COLORS.FORD_BLUE} />
          <Text style={styles.dealerButtonText}>Concessionária</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: 1,
    marginLeft: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  addButtonText: {
    color: FORD_COLORS.WHITE,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyCarIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: SPACING.xl,
  },
  emptyAddButton: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyAddButtonText: {
    color: FORD_COLORS.WHITE,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  carouselContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCard: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: FORD_COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  carImageContainer: {
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  carPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FORD_COLORS.WHITE,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: FORD_COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '60%',
  },
  alertText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.FORD_CHARCOAL,
    marginLeft: 4,
    flexShrink: 1,
  },
  carInfo: {
    padding: SPACING.lg,
  },
  carName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.xs,
  },
  carDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carPlate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  healthBar: {
    height: 4,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    marginHorizontal: SPACING.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  healthProgress: {
    height: '100%',
    borderRadius: 2,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: FORD_COLORS.LIGHT_GRAY,
  },
  detailsButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_BLUE,
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: FORD_COLORS.LIGHT_GRAY,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: FORD_COLORS.FORD_BLUE,
  },
  alertButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_BLUE,
    marginLeft: SPACING.sm,
  },
  dealerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: FORD_COLORS.FORD_BLUE,
  },
  dealerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_BLUE,
    marginLeft: SPACING.sm,
  },
});