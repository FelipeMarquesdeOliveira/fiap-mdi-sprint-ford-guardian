import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { vehicleRepository } from '../../data/repositories';
import { alertRepository } from '../../data/repositories';
import { Vehicle } from '../../domain/entities/Vehicle';
import { Alert } from '../../domain/entities/Alert';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES, HEALTH_STATUS_LABELS } from '../../shared/constants';
import { Card, Button, LoadingSpinner } from '../components';

type VehicleDetailsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({ navigation, route }) => {
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [vehicleId]);

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

  const getHealthColor = (status: Vehicle['healthStatus']) => {
    switch (status) {
      case 'normal':
        return FORD_COLORS.HEALTH_NORMAL;
      case 'attention':
        return FORD_COLORS.HEALTH_ATTENTION;
      case 'critical':
        return FORD_COLORS.HEALTH_CRITICAL;
      default:
        return FORD_COLORS.DARK_GRAY;
    }
  };

  const renderAlertItem = (alert: Alert) => (
    <Card key={alert.id} style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={[styles.alertSeverity, { backgroundColor: alert.severity === 'critical' ? FORD_COLORS.HEALTH_CRITICAL : alert.severity === 'high' ? FORD_COLORS.HEALTH_ATTENTION : FORD_COLORS.FORD_BLUE }]}>
          <Text style={styles.alertSeverityText}>{alert.severity.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.alertTitle}>{alert.title}</Text>
      <Text style={styles.alertDescription}>{alert.description}</Text>
      <View style={styles.alertActions}>
        {alert.severity === 'critical' || alert.severity === 'high' ? (
          <Button
            title="Buscar Concessionária"
            onPress={() => navigation.navigate(ROUTES.FIND_DEALER)}
            variant="primary"
            size="small"
            style={styles.alertButton}
          />
        ) : (
          <Button
            title="Solicitar Revisão"
            onPress={() => navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId })}
            variant="outline"
            size="small"
            style={styles.alertButton}
          />
        )}
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Veículo não encontrado</Text>
      </View>
    );
  }

  const healthColor = getHealthColor(vehicle.healthStatus);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.healthHeader, { backgroundColor: healthColor }]}>
        <Text style={styles.healthLabel}>STATUS DE SAÚDE</Text>
        <Text style={styles.healthValue}>{HEALTH_STATUS_LABELS[vehicle.healthStatus]}</Text>
        <View style={styles.healthGauge}>
          <View style={[styles.healthGaugeFill, { width: vehicle.healthStatus === 'normal' ? '100%' : vehicle.healthStatus === 'attention' ? '60%' : '25%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Card style={styles.vehicleCard}>
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
          <Text style={styles.vehicleYear}>{vehicle.year}</Text>
          <View style={styles.vehicleDetailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Placa</Text>
              <Text style={styles.detailValue}>{vehicle.licensePlate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quilometragem</Text>
              <Text style={styles.detailValue}>{vehicle.mileage.toLocaleString()} km</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>VIN</Text>
              <Text style={styles.detailValue}>{vehicle.vin}</Text>
            </View>
          </View>
        </Card>

        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Alertas Preditivos</Text>
            {alerts.map(renderAlertItem)}
          </View>
        )}

        <View style={styles.actionsSection}>
          <Button
            title="Solicitar Revisão"
            onPress={() => navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId })}
            style={styles.actionButton}
          />
          <Button
            title="Buscar Concessionária"
            onPress={() => navigation.navigate(ROUTES.FIND_DEALER)}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
  },
  healthHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
    letterSpacing: 1,
  },
  healthValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
    marginVertical: SPACING.sm,
  },
  healthGauge: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginTop: SPACING.sm,
  },
  healthGaugeFill: {
    height: '100%',
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: 4,
  },
  content: {
    padding: SPACING.lg,
  },
  vehicleCard: {
    marginBottom: SPACING.lg,
  },
  vehicleModel: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  vehicleYear: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: SPACING.lg,
  },
  vehicleDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_CHARCOAL,
    marginTop: SPACING.xs,
  },
  alertsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.md,
  },
  alertCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: FORD_COLORS.FORD_BLUE,
  },
  alertHeader: {
    marginBottom: SPACING.sm,
  },
  alertSeverity: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  alertSeverityText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
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
  alertActions: {
    flexDirection: 'row',
  },
  alertButton: {
    marginRight: SPACING.sm,
  },
  actionsSection: {
    gap: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: FORD_COLORS.ERROR,
  },
});