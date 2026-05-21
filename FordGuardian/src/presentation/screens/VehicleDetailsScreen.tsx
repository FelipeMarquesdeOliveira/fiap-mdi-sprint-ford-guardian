import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { vehicleRepository } from '../../data/repositories';
import { alertRepository } from '../../data/repositories';
import { Vehicle } from '../../domain/entities/Vehicle';
import { Alert } from '../../domain/entities/Alert';
import { FORD_COLORS } from '../../shared/theme';
import { ROUTES, HEALTH_STATUS_LABELS, getVehicleImage } from '../../shared/constants';
import { Button, LoadingSpinner } from '../components';

const { width } = Dimensions.get('window');
const HERO_IMAGE_WIDTH = Math.min(width - 40, 900);

type VehicleDetailsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({ navigation, route }) => {
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const infoAnim = useRef(new Animated.Value(0)).current;
  const detailsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  useEffect(() => {
    if (!loading && vehicle) {
      Animated.stagger(100, [
        Animated.spring(heroAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.spring(infoAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.spring(detailsAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.spring(actionsAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [loading, vehicle]);

  const loadData = async () => {
    try {
      const vehicleData = await vehicleRepository.getById(vehicleId);
      const vehicleAlerts = await alertRepository.getByVehicleId(vehicleId);
      setVehicle(vehicleData);
      setAlerts(vehicleAlerts.filter(a => !a.isDismissed));
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Vehicle['healthStatus']) => {
    switch (status) {
      case 'normal': return FORD_COLORS.HEALTH_NORMAL;
      case 'attention': return FORD_COLORS.HEALTH_ATTENTION;
      case 'critical': return FORD_COLORS.HEALTH_CRITICAL;
      default: return FORD_COLORS.DARK_GRAY;
    }
  };

  const getProgress = (status: Vehicle['healthStatus']) => {
    switch (status) {
      case 'normal': return 85;
      case 'attention': return 55;
      case 'critical': return 25;
      default: return 0;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return FORD_COLORS.HEALTH_CRITICAL;
      case 'high': return FORD_COLORS.HEALTH_ATTENTION;
      case 'moderate': return FORD_COLORS.FORD_BLUE;
      case 'low': return FORD_COLORS.HEALTH_NORMAL;
      default: return FORD_COLORS.DARK_GRAY;
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Veículo não encontrado</Text>
      </View>
    );
  }

  const healthColor = getStatusColor(vehicle.healthStatus);
  const healthScore = getProgress(vehicle.healthStatus);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Car image hero */}
      <Animated.View style={[
        styles.heroSection,
        {
          opacity: heroAnim,
          transform: [{ scale: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
        },
      ]}>
        <Image
          source={getVehicleImage(vehicle.model)}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Vehicle info */}
      <Animated.View style={[
        styles.titleSection,
        {
          opacity: infoAnim,
          transform: [{ translateY: infoAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
        <Text style={styles.modelName}>{vehicle.model}</Text>
        <Text style={styles.yearPlate}>{vehicle.year} · {vehicle.licensePlate}</Text>

        {/* Health section inline */}
        <View style={styles.healthBlock}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthLabel}>Saúde do Veículo</Text>
            <View style={[styles.statusChip, { backgroundColor: healthColor }]}>
              <Text style={styles.statusChipText}>{HEALTH_STATUS_LABELS[vehicle.healthStatus]}</Text>
            </View>
          </View>
          <View style={styles.healthBarRow}>
            <View style={styles.progressTrack}>
              <Animated.View style={[
                styles.progressFill,
                {
                  backgroundColor: healthColor,
                  width: infoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${healthScore}%`],
                  }),
                },
              ]} />
            </View>
            <Text style={[styles.healthScore, { color: healthColor }]}>{healthScore}%</Text>
          </View>
        </View>
      </Animated.View>

      {/* Details */}
      <Animated.View style={[
        styles.detailsSection,
        {
          opacity: detailsAnim,
          transform: [{ translateY: detailsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
        <DetailRow label="Quilometragem" value={`${vehicle.mileage.toLocaleString('pt-BR')} km`} />
        <DetailRow label="Placa" value={vehicle.licensePlate} />
        <DetailRow label="VIN" value={vehicle.vin} mono />
      </Animated.View>

      {/* Fipe Details - from Fipe API */}
      {vehicle.fipeDetails && (
        <Animated.View style={[
          styles.fipeSection,
          {
            opacity: detailsAnim,
            transform: [{ translateY: detailsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}>
          <View style={styles.fipeHeader}>
            <Ionicons name="information-circle" size={18} color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.fipeTitle}>Dados Fipe</Text>
          </View>
          <View style={styles.fipeCard}>
            <View style={styles.fipeRow}>
              <Text style={styles.fipeLabel}>Valor</Text>
              <Text style={styles.fipeValue}>{vehicle.fipeDetails.valor}</Text>
            </View>
            <View style={styles.fipeRow}>
              <Text style={styles.fipeLabel}>Combustível</Text>
              <Text style={styles.fipeValue}>{vehicle.fipeDetails.combustivel}</Text>
            </View>
            <View style={styles.fipeRow}>
              <Text style={styles.fipeLabel}>Código Fipe</Text>
              <Text style={styles.fipeValue}>{vehicle.fipeDetails.codigoFipe}</Text>
            </View>
            <View style={styles.fipeRow}>
              <Text style={styles.fipeLabel}>Referência</Text>
              <Text style={styles.fipeValue}>{vehicle.fipeDetails.referencia}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Animated.View style={[
          styles.alertsSection,
          {
            opacity: detailsAnim,
            transform: [{ translateY: detailsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}>
          <Text style={styles.sectionTitle}>Alertas</Text>
          {alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={styles.alertItem}
              onPress={() => {
                if (alert.severity === 'critical' || alert.severity === 'high') {
                  navigation.navigate(ROUTES.FIND_DEALER);
                } else {
                  navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.alertDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDesc} numberOfLines={1}>{alert.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={FORD_COLORS.MEDIUM_GRAY} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Actions */}
      <Animated.View style={[
        styles.actionsSection,
        {
          opacity: actionsAnim,
          transform: [{ translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
        <Button
          title="Ver Telemetria"
          onPress={() => navigation.navigate(ROUTES.CAR_CONNECTION, { vehicleId })}
          style={styles.actionButton}
        />
        <View style={styles.actionRow}>
          <Button
            title="Revisão"
            onPress={() => navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId })}
            variant="outline"
            size="small"
            style={styles.actionButtonHalf}
          />
          <Button
            title="Concessionária"
            onPress={() => navigation.navigate(ROUTES.FIND_DEALER, { vehicleId })}
            variant="outline"
            size="small"
            style={styles.actionButtonHalf}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
};

// Simple detail row component
const DetailRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <View style={dStyles.row}>
    <Text style={dStyles.label}>{label}</Text>
    <Text style={[dStyles.value, mono && dStyles.mono]}>{value}</Text>
  </View>
);

const dStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  label: {
    fontSize: 14,
    color: FORD_COLORS.DARK_GRAY,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: FORD_COLORS.FORD_CHARCOAL,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  heroImage: {
    width: HERO_IMAGE_WIDTH,
    height: HERO_IMAGE_WIDTH * 0.55,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  modelName: {
    fontSize: 24,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: -0.3,
  },
  yearPlate: {
    fontSize: 14,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 4,
  },
  healthBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  healthLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: FORD_COLORS.DARK_GRAY,
  },
  healthScore: {
    fontSize: 14,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  healthBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#ECECEC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: FORD_COLORS.WHITE,
  },
  detailsSection: {
    marginHorizontal: 24,
    paddingVertical: 8,
  },
  alertsSection: {
    marginHorizontal: 24,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FORD_COLORS.FORD_CHARCOAL,
  },
  alertDesc: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
    gap: 10,
  },
  actionButton: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonHalf: {
    flex: 1,
  },
  fipeSection: {
    marginHorizontal: 24,
    marginTop: 8,
  },
  fipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  fipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FORD_COLORS.FORD_BLUE,
  },
  fipeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: FORD_COLORS.FORD_BLUE,
  },
  fipeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  fipeLabel: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
  },
  fipeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: FORD_COLORS.ERROR,
  },
});