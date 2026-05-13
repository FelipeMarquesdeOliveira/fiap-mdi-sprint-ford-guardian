import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_DEALERS } from '../../data/mocks';
import { Dealer } from '../../domain/entities/Dealer';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { Card, Button, Input } from '../components';

type FindDealerScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const FindDealerScreen: React.FC<FindDealerScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDealers = MOCK_DEALERS.filter(dealer =>
    dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDealers = [...filteredDealers].sort((a, b) =>
    (a.distance || 0) - (b.distance || 0)
  );

  const renderDealerCard = ({ item }: { item: Dealer }) => (
    <Card style={styles.dealerCard}>
      <View style={styles.dealerHeader}>
        <View style={styles.dealerLogo}>
          <Text style={styles.dealerLogoText}>Ford</Text>
        </View>
        <View style={styles.dealerInfo}>
          <Text style={styles.dealerName}>{item.name}</Text>
          {item.rating && (
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>⭐ {item.rating}</Text>
              <Text style={styles.reviews}>(120 avaliações)</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.dealerDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📞</Text>
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🚗</Text>
          <Text style={styles.detailText}>{item.distance} km</Text>
        </View>
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.servicesLabel}>Serviços:</Text>
        <View style={styles.servicesTags}>
          {item.services.map((service, index) => (
            <Text key={index} style={styles.serviceTag}>{service}</Text>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Ligar"
          onPress={() => {}}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Agendar"
          onPress={() => navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId: '1' })}
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma concessionária encontrada</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Concessionárias Ford</Text>
        <Text style={styles.headerSubtitle}>{sortedDealers.length} locais encontrados</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar por nome ou cidade..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={sortedDealers}
        renderItem={renderDealerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
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
  searchContainer: {
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  listContent: {
    padding: SPACING.lg,
  },
  dealerCard: {
    marginBottom: SPACING.md,
  },
  dealerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  dealerLogo: {
    width: 50,
    height: 50,
    backgroundColor: FORD_COLORS.FORD_DARK_BLUE,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  dealerLogoText: {
    color: FORD_COLORS.WHITE,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dealerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dealerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  reviews: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
    marginLeft: SPACING.xs,
  },
  dealerDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.sm,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  servicesContainer: {
    marginBottom: SPACING.md,
  },
  servicesLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.xs,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  serviceTag: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.DARK_GRAY,
  },
});