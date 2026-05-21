const FIPE_BASE_URL = 'https://parallelum.com.br/fipe/api/v1/carros';

export interface FipeBrand {
  codigo: string;
  nome: string;
}

export interface FipeModel {
  codigo: string;
  nome: string;
}

export interface FipeYear {
  codigo: string;
  nome: string;
}

export interface FipeVehicleDetails {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  Referencia: string;
  TipoVeiculo: number;
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const fipeApi = {
  async getBrands(): Promise<FipeBrand[]> {
    const response = await fetchWithTimeout(`${FIPE_BASE_URL}/marcas`);
    if (!response.ok) throw new Error(`Fipe API error: ${response.status}`);
    return response.json();
  },

  async getModels(brandCode: string): Promise<FipeModel[]> {
    const response = await fetchWithTimeout(`${FIPE_BASE_URL}/marcas/${brandCode}/modelos`);
    if (!response.ok) throw new Error(`Fipe API error: ${response.status}`);
    const data = await response.json();
    return data.modelos || [];
  },

  async getYears(brandCode: string, modelCode: string): Promise<FipeYear[]> {
    const response = await fetchWithTimeout(`${FIPE_BASE_URL}/marcas/${brandCode}/modelos/${modelCode}/anos`);
    if (!response.ok) throw new Error(`Fipe API error: ${response.status}`);
    return response.json();
  },

  async getVehicleDetails(brandCode: string, modelCode: string, yearCode: string): Promise<FipeVehicleDetails> {
    const response = await fetchWithTimeout(`${FIPE_BASE_URL}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);
    if (!response.ok) throw new Error(`Fipe API error: ${response.status}`);
    return response.json();
  },

  async getAllDetailsForModel(brandCode: string, modelCode: string): Promise<FipeVehicleDetails[]> {
    const years = await this.getYears(brandCode, modelCode);
    const detailsPromises = years.map(year => 
      this.getVehicleDetails(brandCode, modelCode, year.codigo).catch(() => null)
    );
    const results = await Promise.all(detailsPromises);
    return results.filter((r): r is FipeVehicleDetails => r !== null);
  },
};