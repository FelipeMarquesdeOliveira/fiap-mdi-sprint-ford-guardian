import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vehicleRepository } from '../../data/repositories';
import { fipeApi, FipeBrand, FipeModel, FipeVehicleDetails, FipeYear } from '../../infrastructure/api';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { Button, Input, Card } from '../components';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AddVehicleScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const AddVehicleScreen: React.FC<AddVehicleScreenProps> = ({ navigation }) => {
  const [brands, setBrands] = useState<FipeBrand[]>([]);
  const [models, setModels] = useState<FipeModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<FipeModel[]>([]);
  const [years, setYears] = useState<FipeYear[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModelCode, setSelectedModelCode] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<FipeVehicleDetails | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (modelSearch.trim()) {
      const filtered = models.filter(m => 
        m.nome.toLowerCase().includes(modelSearch.toLowerCase())
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels(models);
    }
  }, [modelSearch, models]);

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      const data = await fipeApi.getBrands();
      const fordBrands = data.filter(b => b.nome.toLowerCase().includes('ford'));
      setBrands(fordBrands.length > 0 ? fordBrands : data.slice(0, 10));
    } catch (error) {
      console.error('Error loading brands:', error);
      setBrands([{ codigo: '25', nome: 'Ford' }]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleBrandSelect = async (brandCode: string) => {
    setSelectedBrand(brandCode);
    setSelectedModelCode('');
    setSelectedModelName('');
    setSelectedYear('');
    setVehicleDetails(null);
    setModels([]);
    setFilteredModels([]);
    setModelSearch('');

    try {
      setLoadingModels(true);
      const data = await fipeApi.getModels(brandCode);
      setModels(data);
      setFilteredModels(data);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleModelSelect = async (modelCode: string, modelName: string) => {
    setSelectedModelCode(modelCode);
    setSelectedModelName(modelName);
    setSelectedYear('');
    setVehicleDetails(null);
    setYears([]);
    setModelSearch(modelName);
    setFilteredModels([]);

    try {
      setLoadingYears(true);
      const data = await fipeApi.getYears(selectedBrand, modelCode);
      setYears(data);
      if (data.length === 0) {
        Alert.alert('Aviso', 'Nenhum ano encontrado para este modelo');
      }
    } catch (error) {
      console.error('Error loading years:', error);
      Alert.alert('Erro', 'Não foi possível carregar os anos do veículo');
    } finally {
      setLoadingYears(false);
    }
  };

  const handleYearSelect = async (yearCode: string) => {
    setSelectedYear(yearCode);

    try {
      setLoading(true);
      const details = await fipeApi.getVehicleDetails(selectedBrand, selectedModelCode, yearCode);
      setVehicleDetails(details);
    } catch (error) {
      console.error('Error loading vehicle details:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedBrand) {
      newErrors.brand = 'Selecione a marca';
    }

    if (!selectedModelCode) {
      newErrors.model = 'Selecione o modelo';
    }

    if (!selectedYear) {
      newErrors.year = 'Selecione o ano';
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
      const fipeDetails = vehicleDetails ? {
        valor: vehicleDetails.Valor,
        marca: vehicleDetails.Marca,
        modelo: vehicleDetails.Modelo,
        anoModelo: vehicleDetails.AnoModelo,
        combustivel: vehicleDetails.Combustivel,
        codigoFipe: vehicleDetails.CodigoFipe,
        referencia: vehicleDetails.Referencia,
      } : undefined;

      await vehicleRepository.add({
        model: selectedModelName,
        year: vehicleDetails?.AnoModelo || parseInt(selectedYear),
        licensePlate: licensePlate.trim().toUpperCase(),
        mileage: Number(mileage),
        vin: vin.trim() || undefined,
        fipeDetails,
      });

      setLoading(false);
      setShowSuccess(true);

      Animated.sequence([
        Animated.spring(successAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setShowSuccess(false);
        navigation.goBack();
      });

    } catch (error) {
      console.error('Error adding vehicle:', error);
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível cadastrar o veículo');
    }
  };

  const renderModelItem = ({ item }: { item: FipeModel }) => (
    <Button
      title={item.nome}
      onPress={() => handleModelSelect(item.codigo, item.nome)}
      variant={selectedModelCode === item.codigo ? 'filled' : 'outline'}
      size="small"
      style={styles.modelItem}
    />
  );

  return (
    <View style={styles.container}>
      {showSuccess && (
        <Animated.View style={[
          styles.successOverlay,
          {
            opacity: successAnim,
            transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          },
        ]}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={64} color={FORD_COLORS.WHITE} />
            </View>
            <Text style={styles.successTitle}>Veículo Cadastrado!</Text>
            <Text style={styles.successSubtitle}>{selectedModelName}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Card style={styles.formCard}>
          <Text style={styles.title}>Cadastrar Veículo</Text>
          <Text style={styles.subtitle}>Selecione seu veículo Ford</Text>

          <View style={styles.selectContainer}>
            <Text style={styles.label}>Marca *</Text>
            {loadingBrands ? (
              <ActivityIndicator color={FORD_COLORS.FORD_BLUE} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {brands.map(brand => (
                  <Button
                    key={brand.codigo}
                    title={brand.nome}
                    onPress={() => handleBrandSelect(brand.codigo)}
                    variant={selectedBrand === brand.codigo ? 'filled' : 'outline'}
                    size="small"
                    style={styles.optionButton}
                  />
                ))}
              </ScrollView>
            )}
            {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
          </View>

          {selectedBrand && (
            <View style={styles.selectContainer}>
              <Text style={styles.label}>Modelo *</Text>
              <Input
                placeholder="Buscar modelo..."
                value={modelSearch}
                onChangeText={setModelSearch}
              />
              {loadingModels ? (
                <ActivityIndicator color={FORD_COLORS.FORD_BLUE} style={styles.loader} />
              ) : filteredModels.length > 0 ? (
                <View style={styles.modelsList}>
                  {filteredModels.slice(0, 10).map(model => (
                    <Button
                      key={model.codigo}
                      title={model.nome}
                      onPress={() => handleModelSelect(model.codigo, model.nome)}
                      variant={selectedModelCode === model.codigo ? 'filled' : 'outline'}
                      size="small"
                      style={styles.modelItem}
                    />
                  ))}
                </View>
              ) : models.length > 0 && modelSearch === '' ? (
                <View style={styles.modelsList}>
                  {models.slice(0, 10).map(model => (
                    <Button
                      key={model.codigo}
                      title={model.nome}
                      onPress={() => handleModelSelect(model.codigo, model.nome)}
                      variant={selectedModelCode === model.codigo ? 'filled' : 'outline'}
                      size="small"
                      style={styles.modelItem}
                    />
                  ))}
                </View>
              ) : null}
              {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
            </View>
          )}

          {selectedModelCode && (
            <View style={styles.selectContainer}>
              <Text style={styles.label}>Ano *</Text>
              {loadingYears ? (
                <ActivityIndicator color={FORD_COLORS.FORD_BLUE} />
              ) : years.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {years.map(year => (
                    <Button
                      key={year.codigo}
                      title={year.nome}
                      onPress={() => handleYearSelect(year.codigo)}
                      variant={selectedYear === year.codigo ? 'filled' : 'outline'}
                      size="small"
                      style={styles.optionButton}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noDataText}>Nenhum ano disponível</Text>
              )}
              {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
            </View>
          )}

          {vehicleDetails && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Detalhes do Veículo</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valor:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.Valor}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Combustível:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.Combustivel}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Código Fipe:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.CodigoFipe}</Text>
              </View>
            </View>
          )}

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
    </View>
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
  selectContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.sm,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionButton: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  modelItem: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  loader: {
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.HEALTH_CRITICAL,
    marginTop: SPACING.xs,
  },
  noDataText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
    fontStyle: 'italic',
  },
  detailsCard: {
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  detailsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: FORD_COLORS.DARK_GRAY,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_DARK_BLUE,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 68, 140, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: FORD_COLORS.HEALTH_NORMAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: FORD_COLORS.WHITE,
    opacity: 0.9,
  },
});