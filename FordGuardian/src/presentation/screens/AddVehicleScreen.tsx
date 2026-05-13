import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vehicleRepository } from '../../data/repositories';
import { FORD_COLORS, SPACING, TYPOGRAPHY } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { Button, Input, Card } from '../components';

type AddVehicleScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const AddVehicleScreen: React.FC<AddVehicleScreenProps> = ({ navigation }) => {
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }

    if (!year.trim()) {
      newErrors.year = 'Ano é obrigatório';
    } else if (isNaN(Number(year)) || Number(year) < 1900 || Number(year) > 2030) {
      newErrors.year = 'Ano inválido';
    }

    if (!licensePlate.trim()) {
      newErrors.licensePlate = 'Placa é obrigatória';
    }

    if (!mileage.trim()) {
      newErrors.mileage = 'Quilometragem é obrigatória';
    } else if (isNaN(Number(mileage)) || Number(mileage) < 0) {
      newErrors.mileage = 'Quilometragem inválida';
    }

    if (vin && vin.length !== 17) {
      newErrors.vin = 'VIN deve ter 17 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await vehicleRepository.add({
        model: model.trim(),
        year: Number(year),
        licensePlate: licensePlate.trim().toUpperCase(),
        mileage: Number(mileage),
        vin: vin.trim() || undefined,
      });

      Alert.alert('Sucesso', 'Veículo cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o veículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.formCard}>
          <Text style={styles.title}>Cadastrar Veículo</Text>
          <Text style={styles.subtitle}>Informe os dados do seu veículo Ford</Text>

          <Input
            label="Modelo *"
            value={model}
            onChangeText={setModel}
            placeholder="Ex: F-150 XLT"
            error={errors.model}
          />

          <Input
            label="Ano *"
            value={year}
            onChangeText={setYear}
            placeholder="Ex: 2023"
            keyboardType="numeric"
            error={errors.year}
          />

          <Input
            label="Placa *"
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="Ex: ABC-1234"
            autoCapitalize="characters"
            error={errors.licensePlate}
          />

          <Input
            label="Quilometragem (km) *"
            value={mileage}
            onChangeText={setMileage}
            placeholder="Ex: 25000"
            keyboardType="numeric"
            error={errors.mileage}
          />

          <Input
            label="VIN (opcional)"
            value={vin}
            onChangeText={setVin}
            placeholder="17 caracteres"
            autoCapitalize="characters"
            error={errors.vin}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Cadastrar"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            />
          </View>
        </Card>
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
  formCard: {
    padding: SPACING.lg,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
  },
});