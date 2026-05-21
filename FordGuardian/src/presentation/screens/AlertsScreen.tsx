import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Animated, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { alertRepository } from '../../data/repositories';
import { vehicleRepository } from '../../data/repositories';
import { Alert } from '../../domain/entities/Alert';
import { Vehicle } from '../../domain/entities/Vehicle';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES, ALERT_SEVERITY_LABELS, FORD_LOGO } from '../../shared/constants';
import { LoadingSpinner } from '../components';

const { width } = Dimensions.get('window');

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<(Alert & { vehicle?: Vehicle })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAlerts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

  useEffect(() => {
    if (!loading) {
      Animated.stagger(120, [
        Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        Animated.spring(contentAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

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
      case 'critical': return FORD_COLORS.HEALTH_CRITICAL;
      case 'high': return FORD_COLORS.HEALTH_ATTENTION;
      case 'moderate': return FORD_COLORS.FORD_BLUE;
      case 'low': return FORD_COLORS.HEALTH_NORMAL;
      default: return FORD_COLORS.DARK_GRAY;
    }
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'alert-circle';
      case 'high': return 'alert';
      case 'moderate': return 'information';
      case 'low': return 'information-outline';
    }
  };

  const renderAlertItem = ({ item, index }: { item: Alert & { vehicle?: Vehicle }; index: number }) => (
    <TouchableOpacity
      onPress={() => handleAlertPress(item)}
      activeOpacity={0.7}
      style={[styles.alertItem, { borderLeftColor: getSeverityColor(item.severity) }]}
    >
      <View style={styles.alertIconContainer}>
        <MaterialCommunityIcons 
          name={getSeverityIcon(item.severity)} 
          size={24} 
          color={getSeverityColor(item.severity)} 
        />
      </View>
      <View style={styles.alertLeft}>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{ALERT_SEVERITY_LABELS[item.severity]}</Text>
        </View>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertDescription} numberOfLines={2}>{item.description}</Text>
        {item.vehicle && (
          <View style={styles.vehicleTagContainer}>
            <MaterialCommunityIcons name="car" size={12} color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.vehicleTag}>{item.vehicle.model} · {item.vehicle.licensePlate}</Text>
          </View>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={FORD_COLORS.MEDIUM_GRAY} />
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="check-circle-outline" size={48} color={FORD_COLORS.HEALTH_NORMAL} />
      <Text style={styles.emptyTitle}>Nenhum alerta</Text>
      <Text style={styles.emptySubtitle}>Seus veículos estão com saúde em dia!</Text>
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* Consistent header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}>
        <View>
          <Text style={styles.headerTitle}>Alertas Preditivos</Text>
          <Text style={styles.headerCount}>{alerts.length} alerta(s) ativo(s)</Text>
        </View>
        <Image source={FORD_LOGO} style={styles.headerLogo} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={[
        { flex: 1 },
        {
          opacity: contentAnim,
          transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
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
      </Animated.View>
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
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: FORD_COLORS.FORD_BLUE,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
  },
  headerCount: {
    fontSize: 13,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
    marginTop: 2,
  },
  headerLogo: {
    width: 60,
    height: 24,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertLeft: {
    flex: 1,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
    textTransform: 'uppercase',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: 3,
  },
  alertDescription: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: 6,
  },
  vehicleTag: {
    fontSize: 12,
    color: FORD_COLORS.FORD_BLUE,
    fontWeight: '500',
  },
  vehicleTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FORD_COLORS.DARK_GRAY,
    textAlign: 'center',
  },
});