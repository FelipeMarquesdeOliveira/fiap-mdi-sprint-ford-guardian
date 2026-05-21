import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { vehicleRepository } from '../../data/repositories';
import { Vehicle, TelemetryData } from '../../domain/entities/Vehicle';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { Card, LoadingSpinner } from '../components';

const { width } = Dimensions.get('window');

type CarConnectionScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

interface GaugeData {
  label: string;
  value: number;
  unit: string;
  icon: string;
  status: 'good' | 'warning' | 'critical';
  min: number;
  max: number;
  warningThreshold: number;
  criticalThreshold: number;
}

export const CarConnectionScreen: React.FC<CarConnectionScreenProps> = ({ navigation, route }) => {
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dataRefreshAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadVehicle();
    startConnectionSimulation();
    startDataRefresh();
  }, [vehicleId]);

  const startConnectionSimulation = () => {
    setTimeout(() => setConnectionStatus('connected'), 2000);
  };

  const startDataRefresh = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dataRefreshAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dataRefreshAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  useEffect(() => {
    if (connectionStatus === 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [connectionStatus]);

  const loadVehicle = async () => {
    try {
      const data = await vehicleRepository.getById(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGaugeStatus = (data: TelemetryData, key: keyof TelemetryData): 'good' | 'warning' | 'critical' => {
    switch (key) {
      case 'engineTemp':
        if (data.engineTemp > 105) return 'critical';
        if (data.engineTemp > 95) return 'warning';
        return 'good';
      case 'oilLevel':
        if (data.oilLevel < 20) return 'critical';
        if (data.oilLevel < 40) return 'warning';
        return 'good';
      case 'batteryVoltage':
        if (data.batteryVoltage < 11.5) return 'critical';
        if (data.batteryVoltage < 12) return 'warning';
        return 'good';
      case 'tirePressure':
        if (data.tirePressure < 20 || data.tirePressure > 40) return 'critical';
        if (data.tirePressure < 28 || data.tirePressure > 36) return 'warning';
        return 'good';
      case 'fuelLevel':
        if (data.fuelLevel < 15) return 'critical';
        if (data.fuelLevel < 30) return 'warning';
        return 'good';
      default:
        return 'good';
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return FORD_COLORS.HEALTH_NORMAL;
      case 'warning': return FORD_COLORS.HEALTH_ATTENTION;
      case 'critical': return FORD_COLORS.HEALTH_CRITICAL;
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'check-circle';
      case 'warning': return 'alert';
      case 'critical': return 'alert-circle';
    }
  };

  const formatLastService = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} dias atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} ano(s) atrás`;
  };

  if (loading) return <LoadingSpinner />;

  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Veículo não encontrado</Text>
      </View>
    );
  }

  const telemetry = vehicle.telemetry;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Connection Header */}
      <View style={styles.connectionHeader}>
        <View style={styles.connectionStatus}>
          <Animated.View style={[
            styles.connectionDot,
            connectionStatus === 'connected' && {
              backgroundColor: FORD_COLORS.HEALTH_NORMAL,
              transform: [{ scale: pulseAnim }],
            },
            connectionStatus === 'connecting' && {
              backgroundColor: FORD_COLORS.HEALTH_ATTENTION,
            },
            connectionStatus === 'disconnected' && {
              backgroundColor: FORD_COLORS.HEALTH_CRITICAL,
            },
          ]} />
          <Text style={styles.connectionText}>
            {connectionStatus === 'connected' ? 'Conectado' : 
             connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
          </Text>
        </View>
        <Text style={styles.vehicleInfo}>{vehicle.model} · {vehicle.licensePlate}</Text>
        <Text style={styles.lastUpdate}>Última atualização: agora</Text>
      </View>

      {/* Live Gauges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Telemetria em Tempo Real</Text>
        <View style={styles.gaugeGrid}>
          <GaugeCard
            label="Motor"
            value={telemetry.engineTemp}
            unit="°C"
            icon="thermometer"
            status={getGaugeStatus(telemetry, 'engineTemp')}
            statusColor={getStatusColor(getGaugeStatus(telemetry, 'engineTemp'))}
          />
          <GaugeCard
            label="Óleo"
            value={telemetry.oilLevel}
            unit="%"
            icon="oil"
            status={getGaugeStatus(telemetry, 'oilLevel')}
            statusColor={getStatusColor(getGaugeStatus(telemetry, 'oilLevel'))}
          />
          <GaugeCard
            label="Bateria"
            value={telemetry.batteryVoltage}
            unit="V"
            icon="car-battery"
            status={getGaugeStatus(telemetry, 'batteryVoltage')}
            statusColor={getStatusColor(getGaugeStatus(telemetry, 'batteryVoltage'))}
          />
          <GaugeCard
            label="Pneus"
            value={telemetry.tirePressure}
            unit="PSI"
            icon="tire"
            status={getGaugeStatus(telemetry, 'tirePressure')}
            statusColor={getStatusColor(getGaugeStatus(telemetry, 'tirePressure'))}
          />
        </View>
      </View>

      {/* Fuel & Speed */}
      <View style={styles.section}>
        <View style={styles.speedFuelRow}>
          <View style={styles.speedCard}>
            <Ionicons name="speedometer" size={28} color={telemetry.isEngineOn ? FORD_COLORS.FORD_BLUE : FORD_COLORS.MEDIUM_GRAY} />
            <Text style={styles.speedValue}>{telemetry.speed}</Text>
            <Text style={styles.speedLabel}>km/h</Text>
            <View style={styles.engineStatus}>
              <View style={[styles.engineDot, { backgroundColor: telemetry.isEngineOn ? FORD_COLORS.HEALTH_NORMAL : FORD_COLORS.MEDIUM_GRAY }]} />
              <Text style={styles.engineText}>{telemetry.isEngineOn ? 'Motor ligado' : 'Motor desligado'}</Text>
            </View>
          </View>
          <View style={styles.fuelCard}>
            <MaterialCommunityIcons name="fuel" size={28} color={getStatusColor(getGaugeStatus(telemetry, 'fuelLevel'))} />
            <Text style={[styles.fuelValue, { color: getStatusColor(getGaugeStatus(telemetry, 'fuelLevel')) }]}>
              {telemetry.fuelLevel}%
            </Text>
            <Text style={styles.fuelLabel}>Combustível</Text>
            <View style={styles.fuelBar}>
              <View style={[styles.fuelFill, { width: `${telemetry.fuelLevel}%`, backgroundColor: getStatusColor(getGaugeStatus(telemetry, 'fuelLevel')) }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Consumption & Mileage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Gerais</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="gauge" size={20} color={FORD_COLORS.FORD_BLUE} />
              <Text style={styles.infoValue}>{telemetry.mileage.toLocaleString('pt-BR')}</Text>
              <Text style={styles.infoLabel}>km Odômetro</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="gas-station" size={20} color={FORD_COLORS.FORD_BLUE} />
              <Text style={styles.infoValue}>{telemetry.fuelConsumption}</Text>
              <Text style={styles.infoLabel}>km/L Consumo</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Last Service */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico de Serviço</Text>
        <Card style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <MaterialCommunityIcons name="wrench" size={24} color={FORD_COLORS.FORD_BLUE} />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>Última Revisão</Text>
              <Text style={styles.serviceDate}>{new Date(telemetry.lastServiceDate).toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={styles.serviceAgo}>
              <Text style={styles.serviceAgoText}>{formatLastService(telemetry.lastServiceDate)}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId })}>
            <MaterialCommunityIcons name="calendar-plus" size={24} color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.actionText}>Agendar Revisão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate(ROUTES.FIND_DEALER, { vehicleId })}>
            <MaterialCommunityIcons name="map-marker" size={24} color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.actionText}>Concessionária</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

interface GaugeCardProps {
  label: string;
  value: number;
  unit: string;
  icon: string;
  status: 'good' | 'warning' | 'critical';
  statusColor: string;
}

const GaugeCard: React.FC<GaugeCardProps> = ({ label, value, unit, icon, status, statusColor }) => (
  <View style={styles.gaugeCard}>
    <View style={[styles.gaugeIconContainer, { backgroundColor: statusColor + '20' }]}>
      <MaterialCommunityIcons name={icon as any} size={24} color={statusColor} />
    </View>
    <Text style={styles.gaugeLabel}>{label}</Text>
    <Text style={[styles.gaugeValue, { color: statusColor }]}>{value}</Text>
    <Text style={styles.gaugeUnit}>{unit}</Text>
    <View style={[styles.gaugeStatus, { backgroundColor: statusColor }]}>
      <MaterialCommunityIcons 
        name={status === 'good' ? 'check' : status === 'warning' ? 'alert' : 'alert-circle'} 
        size={12} 
        color={FORD_COLORS.WHITE} 
      />
      <Text style={styles.gaugeStatusText}>
        {status === 'good' ? 'Normal' : status === 'warning' ? 'Atenção' : 'Crítico'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
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
  connectionHeader: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: FORD_COLORS.WHITE,
  },
  vehicleInfo: {
    fontSize: 20,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
    marginBottom: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.md,
  },
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  gaugeCard: {
    width: (width - 48 - SPACING.md) / 2,
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  gaugeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  gaugeLabel: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: 4,
  },
  gaugeValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  gaugeUnit: {
    fontSize: 14,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: SPACING.sm,
  },
  gaugeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  gaugeStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: FORD_COLORS.WHITE,
  },
  speedFuelRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  speedCard: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  speedValue: {
    fontSize: 36,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginTop: SPACING.sm,
  },
  speedLabel: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
  },
  engineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 6,
  },
  engineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  engineText: {
    fontSize: 11,
    color: FORD_COLORS.DARK_GRAY,
  },
  fuelCard: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  fuelValue: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  fuelLabel: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
  },
  fuelBar: {
    width: '100%',
    height: 8,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: 4,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  fuelFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoCard: {
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginTop: SPACING.xs,
  },
  infoLabel: {
    fontSize: 11,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  serviceCard: {
    padding: SPACING.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  serviceDate: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  serviceAgo: {
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  serviceAgoText: {
    fontSize: 11,
    color: FORD_COLORS.DARK_GRAY,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  footer: {
    height: 40,
  },
});