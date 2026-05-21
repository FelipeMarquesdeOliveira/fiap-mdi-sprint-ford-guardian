import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, PermissionsAndroid, Platform, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_DEALERS } from '../../data/mocks';
import { nominatimApi } from '../../infrastructure/api';
import { Dealer } from '../../domain/entities/Dealer';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { Card, Button } from '../components';

type FindDealerScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route?: any;
};

interface DisplayDealer extends Dealer {
  distanceKm?: number;
}

const DEALER_ADDRESSES: Record<string, string> = {
  '1': 'Av. Reboucas, 1800 - Pinheiros, São Paulo, SP',
  '2': 'Av. Nobel, 350 - Butantã, São Paulo, SP',
  '3': 'Av. Adolfo Foloni, 500 - Santo Amaro, São Paulo, SP',
  '4': 'Av. Interlagos, 4500 - Interlagos, São Paulo, SP',
};

export const FindDealerScreen: React.FC<FindDealerScreenProps> = ({ navigation, route }) => {
  const vehicleId = route?.params?.vehicleId;
  const [searchText, setSearchText] = useState('');
  const [dealers, setDealers] = useState<DisplayDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    initScreen();
  }, []);

  const initScreen = () => {
    setDealers(MOCK_DEALERS as DisplayDealer[]);
    requestLocation();
  };

  const requestLocation = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Localização',
            message: 'Precisamos da sua localização para calcular distâncias',
            buttonNeutral: 'Depois',
            buttonNegative: 'Não',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocationError('Localização não permitida');
          setLoadingLocation(false);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Permission error:', err);
        setLocationError('Erro ao buscar localização');
        setLoadingLocation(false);
        setLoading(false);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setUserLocation(loc);
        updateDealerDistances(loc.lat, loc.lon);
      },
      (error) => {
        console.warn('Location error:', error);
        setLocationError('Não foi possível obter localização');
        setLoadingLocation(false);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const updateDealerDistances = async (lat: number, lon: number) => {
    try {
      const dealersWithDistance: DisplayDealer[] = [];

      for (const dealer of MOCK_DEALERS) {
        const address = DEALER_ADDRESSES[dealer.id] || dealer.address;
        try {
          const coords = await nominatimApi.getDealerCoordinates(address);
          if (coords) {
            const dist = calculateDistance(lat, lon, coords.lat, coords.lon);
            dealersWithDistance.push({ ...dealer, distanceKm: Math.round(dist * 10) / 10 });
          } else {
            dealersWithDistance.push({ ...dealer, distanceKm: dealer.distance });
          }
        } catch (e) {
          console.warn('Error for dealer', dealer.id, e);
          dealersWithDistance.push({ ...dealer, distanceKm: dealer.distance });
        }
      }

      dealersWithDistance.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
      setDealers(dealersWithDistance);
    } catch (error) {
      console.error('Error updating distances:', error);
      setDealers(MOCK_DEALERS as DisplayDealer[]);
    } finally {
      setLoadingLocation(false);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      if (userLocation) {
        updateDealerDistances(userLocation.lat, userLocation.lon);
      }
      return;
    }

    setLoading(true);
    try {
      const results = await nominatimApi.searchAddress(searchText + ', São Paulo, Brazil');
      if (results.length > 0) {
        const loc = {
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon),
        };
        setUserLocation(loc);
        updateDealerDistances(loc.lat, loc.lon);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
    }
  };

  const handleSelectDealer = (dealer: DisplayDealer) => {
    if (vehicleId) {
      navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId, dealerId: dealer.id, dealerName: dealer.name });
    }
  };

  const filteredDealers = dealers.filter(d =>
    !searchText.trim() ||
    d.name.toLowerCase().includes(searchText.toLowerCase()) ||
    d.city.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderDealer = ({ item }: { item: DisplayDealer }) => (
    <Card style={styles.dealerCard}>
      <View style={styles.dealerHeader}>
        <View style={styles.dealerLogo}>
          <Text style={styles.dealerLogoText}>Ford</Text>
        </View>
        <View style={styles.dealerInfo}>
          <Text style={styles.dealerName}>{item.name}</Text>
          {item.rating && (
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          )}
        </View>
        {item.distanceKm !== undefined && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{item.distanceKm} km</Text>
          </View>
        )}
      </View>

      <View style={styles.dealerDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        {item.phone && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        )}
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.servicesLabel}>Serviços:</Text>
        <View style={styles.servicesTags}>
          {item.services.slice(0, 3).map((service, index) => (
            <Text key={index} style={styles.serviceTag}>{service}</Text>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        {item.phone ? (
          <Button
            title="Ligar"
            onPress={() => {}}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        ) : (
          <View style={styles.actionButton} />
        )}
        <Button
          title="Selecionar"
          onPress={() => handleSelectDealer(item)}
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="business" size={48} color={FORD_COLORS.MEDIUM_GRAY} />
      <Text style={styles.emptyText}>Nenhuma concessionária encontrada</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Concessionárias Ford</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Carregando...' : `${filteredDealers.length} concessionárias`}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou cidade..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={FORD_COLORS.WHITE} size="small" />
            ) : (
              <Ionicons name="search" size={20} color={FORD_COLORS.WHITE} />
            )}
          </TouchableOpacity>
        </View>
        {loadingLocation && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color={FORD_COLORS.FORD_BLUE} />
            <Text style={styles.loadingBannerText}>Calculando distâncias...</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredDealers}
        renderItem={renderDealer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FORD_COLORS.LIGHT_GRAY },
  header: {
    paddingTop: 16,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
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
    backgroundColor: FORD_COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: FORD_COLORS.LIGHT_GRAY,
  },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center' },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  loadingBannerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.FORD_BLUE,
  },
  listContent: { padding: SPACING.lg, flexGrow: 1 },
  dealerCard: { marginBottom: SPACING.md },
  dealerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
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
  dealerInfo: { flex: 1 },
  dealerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  ratingText: { fontSize: TYPOGRAPHY.fontSize.sm, marginTop: SPACING.xs },
  distanceBadge: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.WHITE,
  },
  dealerDetails: { marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  detailIcon: { fontSize: TYPOGRAPHY.fontSize.sm, marginRight: SPACING.sm },
  detailText: { fontSize: TYPOGRAPHY.fontSize.sm, color: FORD_COLORS.DARK_GRAY, flex: 1 },
  servicesContainer: { marginBottom: SPACING.md },
  servicesLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.xs,
  },
  servicesTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  serviceTag: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.DARK_GRAY,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: { flex: 1 },
  emptyContainer: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.DARK_GRAY,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});