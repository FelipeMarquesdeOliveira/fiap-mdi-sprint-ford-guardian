import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, ScrollView } from 'react-native';
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
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(callback, 150);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (vehicles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <MaterialCommunityIcons name="car-off" size={64} color={FORD_COLORS.MEDIUM_GRAY} />
        </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.fordBadge}>
            <Text style={styles.fordBadgeText}>FORD</Text>
          </View>
          <Text style={styles.appName}>GUARDIAN</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate(ROUTES.ADD_VEHICLE)}>
          <MaterialCommunityIcons name="plus" size={18} color={FORD_COLORS.WHITE} />
          <Text style={styles.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.carouselRow}>
          <TouchableOpacity style={styles.navBtn} onPress={handlePrevVehicle} disabled={vehicles.length <= 1}>
            <MaterialCommunityIcons name="chevron-left" size={36} color={vehicles.length <= 1 ? FORD_COLORS.MEDIUM_GRAY : FORD_COLORS.FORD_BLUE} />
          </TouchableOpacity>

          <Animated.View style={[styles.carCard, { opacity: fadeAnim }]}>
            <View style={styles.imageWrap}>
              {currentVehicle.imageUrl ? (
                <Image source={{ uri: currentVehicle.imageUrl }} style={styles.carImg} resizeMode="cover" />
              ) : (
                <View style={styles.imgPlaceholder}>
                  <MaterialCommunityIcons name="car-sports" size={80} color={FORD_COLORS.FORD_LIGHT_BLUE} />
                </View>
              )}

              {currentAlert && (
                <View style={styles.alertPill}>
                  <MaterialCommunityIcons name="alert-circle" size={14} color={statusColor} />
                  <Text style={styles.alertPillText} numberOfLines={1}>{currentAlert.title}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.modelName}>{currentVehicle.model}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.plateTag}>{currentVehicle.licensePlate}</Text>
                <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusPillText}>{HEALTH_STATUS_LABELS[currentVehicle.healthStatus]}</Text>
                </View>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${currentVehicle.healthStatus === 'normal' ? 85 : currentVehicle.healthStatus === 'attention' ? 55 : 25}%`, backgroundColor: statusColor }]} />
            </View>
          </Animated.View>

          <TouchableOpacity style={styles.navBtn} onPress={handleNextVehicle} disabled={vehicles.length <= 1}>
            <MaterialCommunityIcons name="chevron-right" size={36} color={vehicles.length <= 1 ? FORD_COLORS.MEDIUM_GRAY : FORD_COLORS.FORD_BLUE} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: currentVehicle.id })}>
            <MaterialCommunityIcons name="car-cog" size={22} color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.chipLabel}>Detalhes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate(ROUTES.ALERTS)}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.chipLabel}>Alertas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionChip} onPress={() => navigation.navigate(ROUTES.FIND_DEALER)}>
            <MaterialCommunityIcons name="map-marker" size={22} color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.chipLabel}>Concessionária</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId: currentVehicle.id })}>
          <MaterialCommunityIcons name="wrench" size={20} color={FORD_COLORS.WHITE} />
          <Text style={styles.ctaBtnText}>Solicitar Revisão</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fordBadge: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fordBadgeText: {
    color: FORD_COLORS.WHITE,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appName: {
    fontSize: 13,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: 1,
    marginLeft: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: FORD_COLORS.WHITE,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCard: {
    flex: 1,
    marginHorizontal: 12,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  carImg: {
    width: '100%',
    height: '100%',
  },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FORD_COLORS.WHITE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: FORD_COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '65%',
  },
  alertPillText: {
    fontSize: 11,
    color: FORD_COLORS.FORD_CHARCOAL,
    marginLeft: 4,
    flexShrink: 1,
  },
  infoBlock: {
    marginTop: 16,
  },
  modelName: {
    fontSize: 26,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  plateTag: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: FORD_COLORS.WHITE,
  },
  progressTrack: {
    height: 4,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 28,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: 16,
  },
  actionChip: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  chipLabel: {
    fontSize: 11,
    color: FORD_COLORS.FORD_BLUE,
    marginTop: 4,
    fontWeight: '500',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FORD_COLORS.FORD_BLUE,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaBtnText: {
    color: FORD_COLORS.WHITE,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FORD_COLORS.DARK_GRAY,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: FORD_COLORS.WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
});