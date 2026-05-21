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
  const params = route.params as { vehicleId?: string; dealerId?: string; dealerName?: string };
  const { vehicleId, dealerId, dealerName } = params;
  const [vehicleName, setVehicleName] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicle();
    if (dealerId && dealerName) {
      const dealer = MOCK_DEALERS.find(d => d.id === dealerId);
      if (dealer) {
        setSelectedDealer(dealer);
      } else {
        setSelectedDealer({
          id: dealerId,
          name: dealerName,
          address: '',
          city: '',
          state: '',
          phone: '',
          services: [],
        });
      }
    }
  }, [vehicleId, dealerId, dealerName]);

  const loadVehicle = async () => {
    if (!vehicleId) return;
    const vehicle = await vehicleRepository.getById(vehicleId);
    if (vehicle) {
      setVehicleName(`${vehicle.model} (${vehicle.licensePlate})`);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !preferredDate) {
      Alert.alert('Atenção', 'Preencha o tipo de serviço e a data preferida');
      return;
    }

    if (!selectedDealer && !dealerId) {
      Alert.alert('Atenção', 'Selecione uma concessionária');
      return;
    }

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const dealerDisplayName = selectedDealer?.name || dealerName || 'Concessionária selecionada';

    Alert.alert(
      'Solicitação Enviada!',
      `Sua revisão foi agendada para ${preferredDate} na ${dealerDisplayName}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );

    setLoading(false);
  };

  const handleSelectDealer = () => {
    navigation.navigate(ROUTES.FIND_DEALER, { vehicleId });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Solicitar Revisão</Text>
          {vehicleName && (
            <Text style={styles.subtitle}>Veículo: {vehicleName}</Text>
          )}
          {!vehicleId && (
            <Text style={styles.subtitle}>Selecione um veículo ao agendar</Text>
          )}

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
            label="Data Preferida *"
            value={preferredDate}
            onChangeText={setPreferredDate}
            placeholder="Ex: 20/05/2026"
          />
        </Card>

        <Text style={styles.sectionTitle}>Concessionária</Text>

        {selectedDealer || dealerId ? (
          <Card style={styles.selectedDealerCard}>
            <View style={styles.dealerHeader}>
              <View style={styles.dealerLogo}>
                <Text style={styles.dealerLogoText}>Ford</Text>
              </View>
              <View style={styles.dealerInfo}>
                <Text style={styles.dealerName}>{selectedDealer?.name || dealerName}</Text>
                {selectedDealer?.address && (
                  <Text style={styles.dealerAddress}>{selectedDealer.address}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={handleSelectDealer}>
              <Text style={styles.changeDealerText}>Alterar concessionária</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <TouchableOpacity onPress={handleSelectDealer}>
            <Card style={styles.selectDealerCard}>
              <Text style={styles.selectDealerText}>+ Buscar concessionária próxima</Text>
            </Card>
          </TouchableOpacity>
        )}

        <Button
          title="Confirmar Solicitação"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedService || !preferredDate || (!selectedDealer && !dealerId)}
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
  selectDealerCard: {
    marginBottom: SPACING.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: FORD_COLORS.FORD_BLUE,
    backgroundColor: 'transparent',
  },
  selectDealerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.FORD_BLUE,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  selectedDealerCard: {
    marginBottom: SPACING.lg,
  },
  dealerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  dealerAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
    marginTop: SPACING.xs,
  },
  changeDealerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.FORD_BLUE,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});