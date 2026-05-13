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
import { Button, LoadingSpinner, FordLogo, VehicleImage } from '../components';

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

  const healthColor = getStatusColor(vehicle.healthStatus);
  const healthScore = getProgress(vehicle.healthStatus);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.healthHeader, { backgroundColor: healthColor }]}>
        <View style={styles.headerTop}>
          <FordLogo size={40} color={FORD_COLORS.WHITE} />
          <View style={styles.headerTitle}>
            <Text style={styles.headerModel}>{vehicle.model}</Text>
            <Text style={styles.headerYear}>{vehicle.year}</Text>
          </View>
        </View>

        <View style={styles.healthScoreContainer}>
          <View style={styles.scoreCircleLarge}>
            <Text style={styles.scoreValue}>{healthScore}%</Text>
            <Text style={styles.scoreLabel}>Saúde</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{HEALTH_STATUS_LABELS[vehicle.healthStatus]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <VehicleImage model={vehicle.model} size="large" />
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Placa</Text>
              <Text style={styles.detailValue}>{vehicle.licensePlate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quilometragem</Text>
              <Text style={styles.detailValue}>{vehicle.mileage.toLocaleString()} km</Text>
            </View>
          </View>
          <View style={styles.vinContainer}>
            <Text style={styles.detailLabel}>VIN</Text>
            <Text style={styles.vinValue}>{vehicle.vin}</Text>
          </View>
        </View>

        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Alertas Preditivos</Text>
            {alerts.map((alert) => (
              <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
                <View style={styles.alertHeader}>
                  <View style={[styles.alertBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                    <Text style={styles.alertBadgeText}>{alert.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDescription}>{alert.description}</Text>
                <TouchableOpacity
                  style={styles.alertAction}
                  onPress={() => {
                    if (alert.severity === 'critical' || alert.severity === 'high') {
                      navigation.navigate(ROUTES.FIND_DEALER);
                    } else {
                      navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId });
                    }
                  }}
                >
                  <Text style={styles.alertActionText}>
                    {alert.severity === 'critical' || alert.severity === 'high'
                      ? 'Buscar concessionária →'
                      : 'Agendar revisão →'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
    paddingTop: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    marginLeft: SPACING.md,
  },
  headerModel: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  headerYear: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
  },
  healthScoreContainer: {
    alignItems: 'center',
  },
  scoreCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  content: {
    padding: SPACING.lg,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: -SPACING.xl,
    shadowColor: FORD_COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsCard: {
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_CHARCOAL,
    marginTop: SPACING.xs,
  },
  vinContainer: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: FORD_COLORS.LIGHT_GRAY,
  },
  vinValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: 'monospace',
    color: FORD_COLORS.FORD_CHARCOAL,
    marginTop: SPACING.xs,
  },
  alertsSection: {
    marginTop: SPACING.lg,
  },
  alertCard: {
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
  },
  alertHeader: {
    marginBottom: SPACING.sm,
  },
  alertBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  alertBadgeText: {
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
  alertAction: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: FORD_COLORS.LIGHT_GRAY,
  },
  alertActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_BLUE,
  },
  actionsSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  actionButton: {
    width: '100%',
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