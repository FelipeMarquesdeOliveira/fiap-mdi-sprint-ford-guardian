# Ford Guardian - Mobile Sprint

**Desafio 02 - Impulsionando o VIN Share na América do Sul com Soluções Inteligentes**

Aplicativo mobile multiplataforma (iOS/Android) para proprietários de veículos Ford, focado em retenção no pós-venda, monitoramento da saúde do veículo e aumento do VIN Share.

---

## 📱 Screens do App

### 1. Splash Screen
Tela de carregamento com branding Ford e animação.

### 2. Onboarding
3 slides explicativos sobre as principais funcionalidades do app.

### 3. Login
Autenticação com email e senha (mockado).
- **Email:** `felipe@example.com`
- **Senha:** `123456`

### 4. Cadastro
Registro de novo usuário com validação de campos.

### 5. Home (Veículos)
- Carrossel de veículos cadastrados
- Status de saúde do veículo (Normal/Atenção/Crítico)
- Barra de saúde visual
- Indicador de alertas pendentes
- Navegação para detalhes do veículo

### 6. Detalhes do Veículo
- Informações completas do veículo
- Dados Fipe (valor, combustível, código Fipe)
- Status de saúde com barra de progresso
- Lista de alertas vinculados
- Ações rápidas: Solicitar Revisão, Buscar Concessionária

### 7. Cadastro de Veículo
- Seleção de marca (Ford via Fipe API)
- Busca de modelos por texto
- Seleção de ano
- Exibição de detalhes Fipe em tempo real
- Campos: Placa, Quilometragem, VIN (opcional)
- Animação de sucesso ao cadastrar

### 8. Alertas Preditivos
- Lista de alertas ordenados por severidade
- Indicadores visuais: Crítico (vermelho), Alto (laranja), Moderado (azul), Baixo (verde)
- Ícones por tipo de severidade
- Vinculação com veículo
- Pull-to-refresh

### 9. Dashboard (VIN Share Analytics)
- **VIN Share Geral:** Percentual de veículos na rede oficial
- **Distribuição de Serviços:** Gráfico de barras por tipo de serviço
- **Performance por Concessionária:** Ranking com VIN Share e tendência
- **Veículos em Risco:** Lista de veículos que precisam de atenção
- **Idade da Frota:** Distribuição por faixa etária
- **Ações Rápidas:** Leads, Previsões, Notificações

### 10. Solicitar Revisão
- Seleção do tipo de serviço
- Escolha de concessionária (integrado com FindDealer)
- Data preferencial
- Confirmação com feedback visual

### 11. Buscar Concessionária
- Permissão de localização para calcular distâncias
- Geocodificação via Nominatim/OSM
- Lista de concessionárias ordenadas por distância
- Busca por nome ou cidade
- Dados mockados com distâncias reais calculadas

### 12. Perfil do Usuário
- Dados pessoais
- Preferências (notificações)
- Reset de dados de teste (dev tools)
- Logout

---

## 🎯 Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Fipe API** | Busca de veículos por marca/modelo/ano com dados reais de preço e especificações |
| **Nominatim Geolocation** | Cálculo de distâncias reais até concessionárias |
| **Firebase Service** | Estrutura para persistência em nuvem (configurável) |
| **Persistência Local** | AsyncStorage para veículos, alertas, preferências |
| **Status de Saúde** | Normal (verde), Atenção (laranja), Crítico (vermelho) |
| **Alertas Preditivos** | Ordenados por severidade com ícones visuais |
| **Dashboard Analytics** | Métricas de VIN Share, performance de concessionárias |
| **Animação de Sucesso** | Feedback visual ao cadastrar veículo |
| **Pull-to-Refresh** | Atualização de listas |

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **React Native + Expo SDK 54** | Framework principal |
| **TypeScript** | Linguagem tipada |
| **@react-navigation/native 7.x** | Navegação stack + tabs |
| **@react-native-async-storage/async-storage** | Persistência local |
| **React Native Reanimated** | Animações suaves |
| **@expo/vector-icons** | Ícones Material Community |
| **Clean Architecture** | Presentation / Domain / Data / Infrastructure / Shared |

---

## 📁 Estrutura do Projeto

```
FordGuardian/
├── src/
│   ├── presentation/
│   │   ├── screens/        # 12 telas do app
│   │   ├── components/    # Componentes reutilizáveis
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
│       ├── theme/           # Cores, tipografia, espaçamento
│       └── constants/        # Rotas e configuração
├── App.tsx
└── package.json
```

---

## 🚀 Como Rodar

```bash
# Entrar na pasta do projeto
cd FordGuardian

# Instalar dependências
npm install

# Rodar com Expo
npx expo start

# Ou no Android
npx expo start --android

# Ou no iOS
npx expo start --ios
```

**Credenciais mockadas para login:**
- Email: `felipe@example.com`
- Senha: `123456`

---

## 🎨 Paleta Visual Ford

| Cor | Hex | Uso |
|-----|-----|-----|
| Ford Blue | `#1B448C` | Primary, botões, links |
| Ford Dark Blue | `#0D2240` | Headers, texto escuro |
| Ford Silver | `#C0C0C0` | Elementos secundários |
| Health Normal | `#2E7D32` | Verde - status bom |
| Health Attention | `#F57C00` | Laranja - atenção |
| Health Critical | `#C62828` | Vermelho - crítico |

---

## 🔌 APIs Integradas

### Fipe API (Brasil)
- **Endpoint:** `https://parallelum.com.br/fipe/api/v1/carros`
- **Uso:** Busca de marcas, modelos, anos e valores Fipe
- **Gratuita:** Não requer autenticação

### Nominatim/OSM
- **Endpoint:** `https://nominatim.openstreetmap.org`
- **Uso:** Geocodificação e cálculo de distâncias
- **User-Agent:** FordGuardian/1.0

### Firebase Firestore
- **Status:** Configurado (requer credenciais)
- **Fallback:** AsyncStorage se Firebase não configurado

---

## 📊 Dashboard - VIN Share Analytics

O Dashboard apresenta métricas estratégicas para o Desafio 02:

1. **VIN Share Geral:** % de veículos na rede oficial
2. **Distribuição de Serviços:** Revisão Geral, Troca de Óleo, Freios, etc.
3. **Performance por Concessionária:** Ranking com tendências
4. **Veículos em Risco:** Clientes potenciais para retenção
5. **Idade da Frota:** Análise demográfica

---

## 👥 Equipe

| Nome | RM |
|------|-----|
| Felipe Marques | 123456 |

---

## 📝 Critérios de Avaliação

| Critério | Status | Pontos |
|----------|--------|--------|
| Funcionalidade | ✅ | 25 |
| Qualidade Técnica | ✅ | 20 |
| Apresentação | ⏳ | 15 |
| Documentação | ✅ | 15 |
| UX & Design | ✅ | 15 |
| Colaboração Git | ✅ | 5 |
| Diferencial | ✅ | 5 |
| **Total** | | **100** |

---

## 📌 Decisões Técnicas

1. **Clean Architecture** - Separação clara de responsabilidades
2. **Fipe API** - Dados reais do mercado brasileiro
3. **Nominatim** - Geolocalização sem custo
4. **AsyncStorage** - Persistência simples e eficiente
5. **Reanimated** - Animações nativas performáticas
6. **Mock Data** - Concessionárias e alertas pré-definidos

---

## 🔄 Próximos Passos

- Backend real com Node.js/Express
- Autenticação JWT
- Firebase Firestore completo
- Notificações push (FCM)
- Modelo preditivo de churn
- Integração com DMS Ford

---

## 📅 Data de Entrega

**24/05/2026**

---

**Sprint:** Mobile Development & IoT - Ford x FIAP 2026
**Challenge:** Ford x FIAP - Impulsionando o VIN Share

---

#KeepCoding #ReactNative #FIAP #FordGuardian