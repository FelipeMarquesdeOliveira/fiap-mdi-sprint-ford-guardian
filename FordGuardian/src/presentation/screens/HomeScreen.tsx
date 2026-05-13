import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vehicleRepository } from '../../data/repositories';
import { alertRepository } from '../../data/repositories';
import { Vehicle } from '../../domain/entities/Vehicle';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES, HEALTH_STATUS_LABELS } from '../../shared/constants';
import { LoadingSpinner, FordLogo, CircularProgress, VehicleImage } from '../components';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const VehicleCard: React.FC<{ vehicle: Vehicle; onPress: () => void }> = ({ vehicle, onPress }) => {
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
      case 'normal': return 0.85;
      case 'attention': return 0.55;
      case 'critical': return 0.25;
      default: return 0;
    }
  };

  const color = getStatusColor(vehicle.healthStatus);
  const progress = getProgress(vehicle.healthStatus);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.vehicleCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <FordLogo size={28} color={FORD_COLORS.FORD_BLUE} />
            <View style={styles.cardTitle}>
              <Text style={styles.vehicleModel}>{vehicle.model}</Text>
              <Text style={styles.vehicleYear}>{vehicle.year}</Text>
            </View>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: color }]}>
            <Text style={styles.statusText}>{HEALTH_STATUS_LABELS[vehicle.healthStatus]}</Text>
          </View>
        </View>

        <View style={styles.carImageContainer}>
          <VehicleImage model={vehicle.model} size="medium" />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Placa</Text>
            <Text style={styles.infoValue}>{vehicle.licensePlate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Km</Text>
            <Text style={styles.infoValue}>{vehicle.mileage.toLocaleString()}</Text>
          </View>
          <View style={styles.healthScoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: color }]}>
              <Text style={[styles.scoreValue, { color }]}>{Math.round(progress * 100)}%</Text>
            </View>
            <Text style={styles.scoreLabel}>Saúde</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const vehiclesData = await vehicleRepository.getAll();
      const alertsCount = await alertRepository.getUnreadCount();
      setVehicles(vehiclesData);
      setUnreadAlerts(alertsCount);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <FordLogo size={80} color={FORD_COLORS.MEDIUM_GRAY} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum veículo cadastrado</Text>
      <Text style={styles.emptySubtitle}>Adicione seu primeiro veículo Ford para começar</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate(ROUTES.ADD_VEHICLE)}
      >
        <Text style={styles.addButtonText}>+ Adicionar Veículo</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FordLogo size={36} color={FORD_COLORS.WHITE} />
          <View style={styles.headerTitle}>
            <Text style={styles.headerGreeting}>Olá, Felipe</Text>
            <Text style={styles.headerSubtitle}>Seus veículos</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => navigation.navigate(ROUTES.ALERTS)}
        >
          <Text style={styles.alertIcon}>🔔</Text>
          {unreadAlerts > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{unreadAlerts}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[FORD_COLORS.FORD_BLUE]} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: FORD_COLORS.FORD_DARK_BLUE,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: SPACING.md,
  },
  headerGreeting: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.WHITE,
    opacity: 0.7,
  },
  alertButton: {
    position: 'relative',
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.full,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: FORD_COLORS.HEALTH_CRITICAL,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: FORD_COLORS.WHITE,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  vehicleCard: {
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: FORD_COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    marginLeft: SPACING.sm,
  },
  vehicleModel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  vehicleYear: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  statusIndicator: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  carImageContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginTop: 2,
  },
  healthScoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.DARK_GRAY,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  addButton: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: FORD_COLORS.WHITE,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});