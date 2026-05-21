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

const RADIUS_KM = 10;

interface DisplayDealer extends Dealer {
  distanceKm?: number;
}

export const FindDealerScreen: React.FC<FindDealerScreenProps> = ({ navigation, route }) => {
  const vehicleId = route?.params?.vehicleId;
  const [searchText, setSearchText] = useState('');
  const [dealers, setDealers] = useState<DisplayDealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchTriggered, setSearchTriggered] = useState(false);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = () => {
    requestLocationPermission();
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Localização',
            message: 'Precisamos da sua localização para encontrar concessionárias próximas',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocationError('Permissão de localização negada');
          setLoadingLocation(false);
          loadMockDealers();
        }
      } catch (err) {
        console.warn(err);
        setLocationError('Erro ao solicitar permissão');
        setLoadingLocation(false);
        loadMockDealers();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        fetchNearbyDealers(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('Error getting location:', error);
        setLocationError('Não foi possível obter sua localização');
        setLoadingLocation(false);
        loadMockDealers();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const loadMockDealers = () => {
    const mockWithDistance: DisplayDealer[] = MOCK_DEALERS.map(d => ({
      ...d,
      distanceKm: d.distance,
    }));
    setDealers(mockWithDistance);
    setLoading(false);
  };

  const fetchNearbyDealers = async (lat: number, lon: number, searchQuery?: string) => {
    try {
      setLoading(true);
      setLoadingLocation(false);

      let query = 'Ford+concessionaria';
      if (searchQuery && searchQuery.trim()) {
        query = `Ford+concessionaria+${searchQuery.replace(/ /g, '+')}`;
      }

      const nearby = await nominatimApi.findNearbyDealers(lat, lon, RADIUS_KM);

      if (nearby.length > 0) {
        const dealersWithDistance: DisplayDealer[] = nearby.map((d, index) => ({
          id: `nearby_${index}`,
          name: d.name.split(',')[0] || d.name,
          address: d.address,
          city: d.address.split(',').length > 2 ? d.address.split(',')[2].trim() : 'São Paulo',
          state: 'SP',
          phone: '',
          distanceKm: d.distance ? Math.round(d.distance * 10) / 10 : undefined,
          rating: 4.5,
          services: ['Revisão Geral', 'Troca de Óleo', 'Freios'],
        }));

        dealersWithDistance.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
        setDealers(dealersWithDistance);
      } else {
        loadMockDealers();
      }
    } catch (error) {
      console.error('Error fetching nearby dealers:', error);
      loadMockDealers();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTriggered(true);

    if (!userLocation) {
      if (searchText.trim()) {
        geocodeSearchAddress();
      } else {
        Alert.alert('Localização indisponível', 'Busque por um endereço ou permita o acesso à localização');
      }
      return;
    }

    if (searchText.trim()) {
      geocodeSearchAddress();
    } else {
      fetchNearbyDealers(userLocation.lat, userLocation.lon);
    }
  };

  const geocodeSearchAddress = async () => {
    if (!searchText.trim()) return;

    setLoading(true);
    try {
      const results = await nominatimApi.searchAddress(searchText + ', São Paulo, Brazil');
      if (results.length > 0) {
        const location = {
          lat: parseFloat(results[0].lat),
          lon: parseFloat(results[0].lon),
        };
        setUserLocation(location);
        await fetchNearbyDealers(location.lat, location.lon, searchText);
      } else {
        Alert.alert('Não encontrado', 'Não encontramos concessionárias para essa busca');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar a busca');
      setLoading(false);
    }
  };

  const handleSelectDealer = (dealer: DisplayDealer) => {
    if (vehicleId) {
      navigation.navigate(ROUTES.REQUEST_REVIEW, { vehicleId, dealerId: dealer.id, dealerName: dealer.name });
    }
  };

  const sortedDealers = [...dealers].sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

  const renderDealerCard = ({ item }: { item: DisplayDealer }) => (
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
            </View>
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

      {item.services && item.services.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesLabel}>Serviços:</Text>
          <View style={styles.servicesTags}>
            {item.services.slice(0, 4).map((service: string, index: number) => (
              <Text key={index} style={styles.serviceTag}>{service}</Text>
            ))}
          </View>
        </View>
      )}

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

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loading || loadingLocation ? (
        <>
          <ActivityIndicator color={FORD_COLORS.FORD_BLUE} size="large" />
          <Text style={styles.emptyText}>
            {loadingLocation ? 'Buscando sua localização...' : 'Buscando concessionárias...'}
          </Text>
        </>
      ) : locationError ? (
        <>
          <Ionicons name="location-outline" size={48} color={FORD_COLORS.MEDIUM_GRAY} />
          <Text style={styles.emptyText}>{locationError}</Text>
          <Text style={styles.emptySubtext}>Você pode buscar por um endereço abaixo</Text>
        </>
      ) : (
        <>
          <Ionicons name="search" size={48} color={FORD_COLORS.MEDIUM_GRAY} />
          <Text style={styles.emptyText}>Nenhuma concessionária encontrada</Text>
          <Text style={styles.emptySubtext}>Tente buscar por outro endereço</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Concessionárias Ford</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Buscando...' : `${sortedDealers.length} encontradas em até ${RADIUS_KM} km`}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por endereço ou bairro..."
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
        {locationError && (
          <Text style={styles.locationWarning}>
            📍 {locationError}
          </Text>
        )}
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  locationWarning: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.HEALTH_ATTENTION,
    marginTop: SPACING.sm,
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  dealerCard: {
    marginBottom: SPACING.md,
  },
  dealerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
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
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.MEDIUM_GRAY,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});