import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { alertRepository } from '../../data/repositories';
import { vehicleRepository } from '../../data/repositories';
import { Alert } from '../../domain/entities/Alert';
import { Vehicle } from '../../domain/entities/Vehicle';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES, ALERT_SEVERITY_LABELS } from '../../shared/constants';
import { Card, LoadingSpinner } from '../components';

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<(Alert & { vehicle?: Vehicle })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const allAlerts = await alertRepository.getAll();
      const vehicles = await vehicleRepository.getAll();

      const alertsWithVehicle = allAlerts
        .filter(a => !a.isDismissed)
        .map(alert => ({
          ...alert,
          vehicle: vehicles.find(v => v.id === alert.vehicleId),
        }));

      alertsWithVehicle.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      setAlerts(alertsWithVehicle);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleAlertPress = (alert: Alert) => {
    navigation.navigate(ROUTES.VEHICLE_DETAILS, { vehicleId: alert.vehicleId });
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return FORD_COLORS.HEALTH_CRITICAL;
      case 'high':
        return FORD_COLORS.HEALTH_ATTENTION;
      case 'moderate':
        return FORD_COLORS.FORD_BLUE;
      case 'low':
        return FORD_COLORS.HEALTH_NORMAL;
      default:
        return FORD_COLORS.DARK_GRAY;
    }
  };

  const renderAlertItem = ({ item }: { item: Alert & { vehicle?: Vehicle } }) => (
    <TouchableOpacity onPress={() => handleAlertPress(item)} activeOpacity={0.7}>
      <Card style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>{ALERT_SEVERITY_LABELS[item.severity]}</Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertDescription} numberOfLines={2}>{item.description}</Text>

        {item.vehicle && (
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{item.vehicle.model}</Text>
            <Text style={styles.vehiclePlate}>{item.vehicle.licensePlate}</Text>
          </View>
        )}

        <Text style={styles.alertTime}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✅</Text>
      <Text style={styles.emptyTitle}>Nenhum alerta</Text>
      <Text style={styles.emptySubtitle}>Seus veículos estão com saúde em dia!</Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertas Preditivos</Text>
        <Text style={styles.headerSubtitle}>{alerts.length} alerta(s)</Text>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
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
    padding: SPACING.lg,
    backgroundColor: FORD_COLORS.FORD_BLUE,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  alertCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: FORD_COLORS.FORD_BLUE,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  severityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  severityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FORD_COLORS.FORD_BLUE,
  },
  alertTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.xs,
  },
  alertDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: SPACING.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  vehicleName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_BLUE,
  },
  vehiclePlate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
    marginLeft: SPACING.sm,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  alertTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
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
  },
});