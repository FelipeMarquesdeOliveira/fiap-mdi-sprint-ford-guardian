import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';

const { width } = Dimensions.get('window');

interface ServiceStat {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

interface DealerPerformance {
  id: string;
  name: string;
  vinShare: number;
  services: number;
  trend: 'up' | 'down' | 'stable';
}

interface RiskLead {
  vehicle: string;
  plate: string;
  daysSinceLastService: number;
  risk: 'high' | 'medium' | 'low';
  reason: string;
}

const MOCK_SERVICE_STATS: ServiceStat[] = [
  { label: 'Revisão Geral', value: '2.847', percentage: 42, color: FORD_COLORS.FORD_BLUE },
  { label: 'Troca de Óleo', value: '1.523', percentage: 22, color: FORD_COLORS.HEALTH_NORMAL },
  { label: 'Freios', value: '986', percentage: 15, color: FORD_COLORS.HEALTH_ATTENTION },
  { label: 'Suspensão', value: '654', percentage: 10, color: '#9C27B0' },
  { label: 'Outros', value: '890', percentage: 11, color: FORD_COLORS.MEDIUM_GRAY },
];

const MOCK_DEALERS_PERFORMANCE: DealerPerformance[] = [
  { id: '1', name: 'Ford Capital - Pinheiros', vinShare: 78, services: 1247, trend: 'up' },
  { id: '2', name: 'Ford Auto Shopping - Butantã', vinShare: 72, services: 1089, trend: 'stable' },
  { id: '3', name: 'Ford Zona Sul - Santo Amaro', vinShare: 65, services: 956, trend: 'down' },
  { id: '4', name: 'Ford Interlagos', vinShare: 58, services: 734, trend: 'down' },
];

const MOCK_RISK_LEADS: RiskLead[] = [
  { vehicle: 'Mustang GT', plate: 'FRD-1A23', daysSinceLastService: 142, risk: 'high', reason: 'Excedeu tempo de revisão' },
  { vehicle: 'Bronco Sport', plate: 'FRD-2B45', daysSinceLastService: 89, risk: 'medium', reason: 'Revisão em atraso' },
  { vehicle: 'Ranger', plate: 'FRD-3C67', daysSinceLastService: 210, risk: 'high', reason: 'Fora da rede há 7 meses' },
  { vehicle: 'Territory', plate: 'FRD-4D89', daysSinceLastService: 45, risk: 'low', reason: 'Próximo do prazo' },
];

export const DashboardScreen: React.FC = () => {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      Animated.spring(contentAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const getVinShareColor = (share: number) => {
    if (share >= 70) return FORD_COLORS.HEALTH_NORMAL;
    if (share >= 50) return FORD_COLORS.HEALTH_ATTENTION;
    return FORD_COLORS.HEALTH_CRITICAL;
  };

  const getRiskColor = (risk: RiskLead['risk']) => {
    switch (risk) {
      case 'high': return FORD_COLORS.HEALTH_CRITICAL;
      case 'medium': return FORD_COLORS.HEALTH_ATTENTION;
      case 'low': return FORD_COLORS.HEALTH_NORMAL;
    }
  };

  const getTrendIcon = (trend: DealerPerformance['trend']) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'minus';
    }
  };

  const getTrendColor = (trend: DealerPerformance['trend']) => {
    switch (trend) {
      case 'up': return FORD_COLORS.HEALTH_NORMAL;
      case 'down': return FORD_COLORS.HEALTH_CRITICAL;
      case 'stable': return FORD_COLORS.MEDIUM_GRAY;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>VIN Share Analytics</Text>
            <Text style={styles.headerSubtitle}>Desafio 02 - Ford x FIAP</Text>
          </View>
          <View style={styles.vinShareBadge}>
            <Text style={styles.vinShareValue}>68%</Text>
            <Text style={styles.vinShareLabel}>VIN Share</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[
        styles.content,
        {
          opacity: contentAnim,
          transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}>
        {/* Service Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribuição de Serviços</Text>
          <View style={styles.card}>
            {MOCK_SERVICE_STATS.map((stat, index) => (
              <View key={index} style={styles.serviceRow}>
                <View style={[styles.serviceDot, { backgroundColor: stat.color }]} />
                <Text style={styles.serviceLabel}>{stat.label}</Text>
                <Text style={styles.serviceValue}>{stat.value}</Text>
                <View style={styles.serviceBarContainer}>
                  <View style={[styles.serviceBar, { width: `${stat.percentage}%`, backgroundColor: stat.color }]} />
                </View>
                <Text style={styles.servicePercent}>{stat.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dealer Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance por Concessionária</Text>
          <View style={styles.card}>
            {MOCK_DEALERS_PERFORMANCE.map((dealer, index) => (
              <View key={dealer.id} style={[styles.dealerRow, index < MOCK_DEALERS_PERFORMANCE.length - 1 && styles.dealerRowBorder]}>
                <View style={styles.dealerInfo}>
                  <Text style={styles.dealerName} numberOfLines={1}>{dealer.name}</Text>
                  <Text style={styles.dealerServices}>{dealer.services} serviços/mês</Text>
                </View>
                <View style={styles.dealerStats}>
                  <View style={[styles.vinShareIndicator, { backgroundColor: getVinShareColor(dealer.vinShare) }]}>
                    <Text style={styles.vinShareNumber}>{dealer.vinShare}%</Text>
                  </View>
                  <MaterialCommunityIcons
                    name={getTrendIcon(dealer.trend)}
                    size={20}
                    color={getTrendColor(dealer.trend)}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Leads at Risk */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veículos em Risco</Text>
          <View style={styles.card}>
            {MOCK_RISK_LEADS.map((lead, index) => (
              <View key={index} style={[styles.leadRow, index < MOCK_RISK_LEADS.length - 1 && styles.leadRowBorder]}>
                <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(lead.risk) }]} />
                <View style={styles.leadInfo}>
                  <Text style={styles.leadVehicle}>{lead.vehicle}</Text>
                  <Text style={styles.leadPlate}>{lead.plate}</Text>
                </View>
                <View style={styles.leadMeta}>
                  <Text style={styles.leadDays}>{lead.daysSinceLastService} dias</Text>
                  <Text style={styles.leadReason} numberOfLines={1}>{lead.reason}</Text>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(lead.risk) + '20' }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskColor(lead.risk) }]}>
                    {lead.risk === 'high' ? 'Alto' : lead.risk === 'medium' ? 'Médio' : 'Baixo'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Vehicle Age Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idade da Frota</Text>
          <View style={styles.ageCard}>
            <View style={styles.ageRow}>
              <View style={styles.ageItem}>
                <Text style={styles.ageValue}>2.3</Text>
                <Text style={styles.ageLabel}>anos média</Text>
              </View>
              <View style={styles.ageDivider} />
              <View style={styles.ageItem}>
                <Text style={styles.ageValue}>847</Text>
                <Text style={styles.ageLabel}>veículos novos</Text>
              </View>
              <View style={styles.ageDivider} />
              <View style={styles.ageItem}>
                <Text style={styles.ageValue}>1.2K</Text>
                <Text style={styles.ageLabel}>> 5 anos</Text>
              </View>
            </View>
            <View style={styles.ageBar}>
              <View style={[styles.ageBarSegment, { flex: 4, backgroundColor: FORD_COLORS.HEALTH_NORMAL }]} />
              <View style={[styles.ageBarSegment, { flex: 3, backgroundColor: FORD_COLORS.FORD_BLUE }]} />
              <View style={[styles.ageBarSegment, { flex: 2, backgroundColor: FORD_COLORS.HEALTH_ATTENTION }]} />
              <View style={[styles.ageBarSegment, { flex: 1, backgroundColor: FORD_COLORS.HEALTH_CRITICAL }]} />
            </View>
            <View style={styles.ageLegend}>
              <Text style={styles.ageLegendText}>0-2 anos</Text>
              <Text style={styles.ageLegendText}>2-5 anos</Text>
              <Text style={styles.ageLegendText}>5-8 anos</Text>
              <Text style={styles.ageLegendText}>8+ anos</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsRow}>
            <View style={styles.actionCard}>
              <MaterialCommunityIcons name="account-plus" size={28} color={FORD_COLORS.FORD_BLUE} />
              <Text style={styles.actionText}>Gerar Leads</Text>
            </View>
            <View style={styles.actionCard}>
              <MaterialCommunityIcons name="chart-line" size={28} color={FORD_COLORS.HEALTH_ATTENTION} />
              <Text style={styles.actionText}>Previsões</Text>
            </View>
            <View style={styles.actionCard}>
              <MaterialCommunityIcons name="bell-plus" size={28} color={FORD_COLORS.HEALTH_NORMAL} />
              <Text style={styles.actionText}>Notificações</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
  },
  header: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
  },
  headerSubtitle: {
    fontSize: 13,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
    marginTop: 4,
  },
  vinShareBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  vinShareValue: {
    fontSize: 24,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
  },
  vinShareLabel: {
    fontSize: 11,
    color: FORD_COLORS.WHITE,
    opacity: 0.8,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  serviceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  serviceLabel: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
    width: 80,
  },
  serviceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    width: 50,
  },
  serviceBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: 3,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  serviceBar: {
    height: '100%',
    borderRadius: 3,
  },
  servicePercent: {
    fontSize: 12,
    fontWeight: '600',
    color: FORD_COLORS.DARK_GRAY,
    width: 35,
    textAlign: 'right',
  },
  dealerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dealerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: FORD_COLORS.LIGHT_GRAY,
  },
  dealerInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  dealerName: {
    fontSize: 14,
    fontWeight: '500',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  dealerServices: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  dealerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  vinShareIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  vinShareNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  leadRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: FORD_COLORS.LIGHT_GRAY,
  },
  riskIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  leadInfo: {
    flex: 1,
  },
  leadVehicle: {
    fontSize: 14,
    fontWeight: '500',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  leadPlate: {
    fontSize: 12,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  leadMeta: {
    marginHorizontal: SPACING.sm,
    alignItems: 'flex-end',
  },
  leadDays: {
    fontSize: 14,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  leadReason: {
    fontSize: 10,
    color: FORD_COLORS.DARK_GRAY,
    maxWidth: 80,
  },
  riskBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ageCard: {
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  ageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  ageItem: {
    alignItems: 'center',
  },
  ageValue: {
    fontSize: 22,
    fontWeight: '700',
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  ageLabel: {
    fontSize: 11,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: 2,
  },
  ageDivider: {
    width: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
  },
  ageBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  ageBarSegment: {
    height: '100%',
  },
  ageLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ageLegendText: {
    fontSize: 10,
    color: FORD_COLORS.DARK_GRAY,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
});