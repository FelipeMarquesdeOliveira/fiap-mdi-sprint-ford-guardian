# Ford Guardian - Mobile Sprint

**Desafio 02 - Impulsionando o VIN Share na América do Sul com Soluções Inteligentes**

Aplicativo mobile multiplataforma (iOS/Android) para proprietarios de veiculos Ford, focado em retencao no pos-venda, monitoramento da saude do veiculo e aumento do VIN Share.

---

## Screenshots

![01 - Splash](assets/screens/01-splash.png)

![02 - Onboarding](assets/screens/02-onboarding.png)

![03 - Login](assets/screens/03-login.png)

![04 - Home](assets/screens/04-home.png)

![05 - Detalhes do Veiculo](assets/screens/05-vehicle-details.png)

![06 - Telemetria](assets/screens/06-telemetria.png)

![07 - Alertas](assets/screens/07-alertas.png)

![08 - Dashboard](assets/screens/08-dashboard.png)

![09 - Buscar Concessionaria](assets/screens/09-buscar-concessionaria.png)

![10 - Perfil](assets/screens/10-perfil.png)

![11 - Cadastro de Veiculo](assets/screens/11-cadastro-veiculo.png)

---

## Funcionalidades

| Funcionalidade | Descricao |
|----------------|-----------|
| **Fipe API** | Busca de veiculos por marca/modelo/ano com dados reais de preco e especificacoes |
| **Nominatim Geolocation** | Calculo de distancias reais ate concessionarias |
| **Firebase Service** | Estrutura para persistencia em nuvem (configuravel) |
| **Persistencia Local** | AsyncStorage para veiculos, alertas, preferencias |
| **Status de Saude** | Normal (verde), Atencao (laranja), Critico (vermelho) |
| **Alertas Preditivos** | Ordenados por severidade com icones visuais |
| **Dashboard Analytics** | Metricas de VIN Share, performance de concessionarias |
| **Animacao de Sucesso** | Feedback visual ao cadastrar veiculo |
| **Pull-to-Refresh** | Atualizacao de listas |

---

## Stack Tecnologica

| Tecnologia | Uso |
|------------|-----|
| **React Native + Expo SDK 54** | Framework principal |
| **TypeScript** | Linguagem tipada |
| **@react-navigation/native 7.x** | Navegacao stack + tabs |
| **@react-native-async-storage/async-storage** | Persistencia local |
| **React Native Reanimated** | Animações suaves |
| **@expo/vector-icons** | Icones Material Community |
| **Clean Architecture** | Presentation / Domain / Data / Infrastructure / Shared |

---

## Estrutura do Projeto

```
FordGuardian/
├── src/
│   ├── presentation/
│   │   ├── screens/        # 12 telas do app
│   │   ├── components/    # Componentes reutilizaveis
│   │   └── navigation/     # AppNavigator (Stack + Tabs)
│   ├── domain/
│   │   └── entities/      # User, Vehicle, Alert, Dealer, FipeDetails
│   ├── data/
│   │   ├── repositories/   # VehicleRepository, AlertRepository, UserRepository
│   │   └── mocks/          # Dados mockados
│   ├── infrastructure/
│   │   ├── api/            # fipeApi, nominatimApi, firebaseService
│   │   └── storage/        # AsyncStorage Service
│   └── shared/
│       ├── theme/           # Cores, tipografia, espacao
│       └── constants/        # Rotas e configuracao
├── App.tsx
└── package.json
```

---

## Como Rodar

```bash
cd FordGuardian
npm install
npx expo start
```

**Credenciais mockadas para login:**
- Email: `felipe@example.com`
- Senha: `123456`

---

## APIs Integradas

### Fipe API (Brasil)
- **Endpoint:** `https://parallelum.com.br/fipe/api/v1/carros`
- **Uso:** Busca de marcas, modelos, anos e valores Fipe

### Nominatim/OSM
- **Endpoint:** `https://nominatim.openstreetmap.org`
- **Uso:** Geocodificacao e calculo de distancias

### Firebase Firestore
- **Status:** Configurado (requer credenciais)
- **Fallback:** AsyncStorage se Firebase nao configurado

---

## Equipe

| Nome | RM |
|------|-----|
| Felipe Marques | 556319 |
| Gabriel Barros Cisoto | 556309 |

---

## Decisoes Tecnicas

1. **Clean Architecture** - Separacao clara de responsabilidades
2. **Fipe API** - Dados reais do mercado brasileiro
3. **Nominatim** - Geolocalizacao sem custo
4. **AsyncStorage** - Persistencia simples e eficiente
5. **Reanimated** - Animações nativas performaticas
6. **Mock Data** - Concessionarias e alertas pre-definidos

---

**Sprint:** Mobile Development & IoT - Ford x FIAP 2026
**Challenge:** Ford x FIAP - Impulsionando o VIN Share

#KeepCoding #ReactNative #FIAP #FordGuardian