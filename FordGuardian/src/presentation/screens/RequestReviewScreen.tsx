import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MOCK_DEALERS } from '../../data/mocks';
import { Dealer, ServiceType } from '../../domain/entities/Dealer';
import { vehicleRepository } from '../../data/repositories';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { Button, Card, Input } from '../components';

type RequestReviewScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

const SERVICE_TYPES: { label: string; value: ServiceType }[] = [
  { label: 'Troca de Óleo', value: 'oil_change' },
  { label: 'Inspeção de Freios', value: 'brake_inspection' },
  { label: 'Rodízio de Rodas', value: 'tire_rotation' },
  { label: 'Revisão Geral', value: 'general_review' },
  { label: 'Outro', value: 'other' },
];

export const RequestReviewScreen: React.FC<RequestReviewScreenProps> = ({ navigation, route }) => {
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicleName, setVehicleName] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    const vehicle = await vehicleRepository.getById(vehicleId);
    if (vehicle) {
      setVehicleName(`${vehicle.model} (${vehicle.licensePlate})`);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !preferredDate || !selectedDealer) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    Alert.alert(
      'Solicitação Enviada!',
      `Sua revisão foi agendada para ${preferredDate} na ${selectedDealer.name}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Solicitar Revisão</Text>
          <Text style={styles.subtitle}>Veículo: {vehicleName}</Text>

          <Text style={styles.sectionLabel}>Tipo de Serviço</Text>
          <View style={styles.serviceGrid}>
            {SERVICE_TYPES.map((service) => (
              <Button
                key={service.value}
                title={service.label}
                onPress={() => setSelectedService(service.value)}
                variant={selectedService === service.value ? 'primary' : 'outline'}
                size="small"
                style={styles.serviceButton}
              />
            ))}
          </View>

          <Input
            label="Data Preferida"
            value={preferredDate}
            onChangeText={setPreferredDate}
            placeholder="Ex: 20/05/2026"
          />
        </Card>

        <Text style={styles.sectionTitle}>Selecione uma Concessionária</Text>

        {MOCK_DEALERS.map((dealer) => (
          <TouchableOpacity
            key={dealer.id}
            onPress={() => setSelectedDealer(dealer)}
            activeOpacity={0.7}
          >
            <Card style={{ ...styles.dealerCard, borderColor: selectedDealer?.id === dealer.id ? FORD_COLORS.FORD_BLUE : 'transparent' }}>
              <View style={styles.dealerHeader}>
                <Text style={styles.dealerName}>{dealer.name}</Text>
                {dealer.rating && (
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {dealer.rating}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.dealerAddress}>{dealer.address}</Text>
              <Text style={styles.dealerDistance}>{dealer.distance} km de distância</Text>
              <View style={styles.dealerServices}>
                {dealer.services.slice(0, 3).map((service, index) => (
                  <Text key={index} style={styles.serviceTag}>{service}</Text>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <Button
          title="Confirmar Solicitação"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedService || !preferredDate || !selectedDealer}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
  },
  content: {
    padding: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.md,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  serviceButton: {
    marginBottom: SPACING.xs,
  },
  dealerCard: {
    marginBottom: SPACING.md,
    borderWidth: 2,
  },
  dealerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dealerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  dealerAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
    marginBottom: SPACING.xs,
  },
  dealerDistance: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.FORD_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.sm,
  },
  dealerServices: {
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
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});