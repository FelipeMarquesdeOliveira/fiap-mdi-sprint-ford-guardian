import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vehicleRepository } from '../../data/repositories';
import { alertRepository } from '../../data/repositories';
import { Vehicle } from '../../domain/entities/Vehicle';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { Card, HealthBadge, LoadingSpinner } from '../components';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
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

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.vehicleCard}>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleModel}>{item.model}</Text>
            <Text style={styles.vehicleYear}>{item.year}</Text>
          </View>
          <HealthBadge status={item.healthStatus} />
        </View>
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehiclePlate}>{item.licensePlate}</Text>
          <Text style={styles.vehicleMileage}>{item.mileage.toLocaleString()} km</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum veículo cadastrado</Text>
      <Text style={styles.emptySubtitle}>Adicione seu primeiro veículo Ford</Text>
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
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userName}>Felipe</Text>
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

      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>Meus Veículos</Text>
        {vehicles.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.ADD_VEHICLE)}>
            <Text style={styles.addText}>+ Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[FORD_COLORS.FORD_BLUE]} />
        }
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
    backgroundColor: FORD_COLORS.FORD_BLUE,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  alertButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: FORD_COLORS.HEALTH_CRITICAL,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: FORD_COLORS.WHITE,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  addText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.FORD_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  vehicleCard: {
    marginBottom: SPACING.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  vehicleInfo: {},
  vehicleModel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  vehicleYear: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehiclePlate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  vehicleMileage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.DARK_GRAY,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addButton: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: FORD_COLORS.WHITE,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});