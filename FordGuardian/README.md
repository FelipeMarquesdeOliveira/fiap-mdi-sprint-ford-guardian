# Ford Guardian

**Desafio 02 - Impulsionando o VIN Share na América do Sul com soluções inteligentes.**

Aplicativo mobile para proprietários de veículos Ford, focado em retenção no pós-venda e monitoramento da saúde do veículo.

---

## 📋 Funcionalidades Implementadas

### Telas do App

| Tela | Descrição | Status |
|------|-----------|--------|
| Splash Screen | Tela de carregamento com branding Ford | ✅ |
| Onboarding | 3 slides explicativos | ✅ |
| Login | Autenticação mockada | ✅ |
| Cadastro | Registro de novo usuário | ✅ |
| Home | Lista de veículos cadastrados | ✅ |
| Cadastro de Veículo | Adicionar veículo Ford | ✅ |
| Detalhes do Veículo | Informações + status de saúde | ✅ |
| Alertas Preditivos | Lista de alertas (mockados) | ✅ |
| Solicitar Revisão | Agendar em concessionária | ✅ |
| Buscar Concessionária | Localização mockada | ✅ |
| Perfil do Usuário | Dados e preferências | ✅ |

### Recursos

- **Status de Saúde do Veículo:** Normal (verde), Atenção (laranja), Crítico (vermelho)
- **Alertas Preditivos:** Troca de óleo, revisão preventiva, possível falha no motor
- **Persistência Local:** AsyncStorage para onboarding, login e veículos
- **Gamificação Leve:** Indicadores visuais de saúde

---

## 🛠️ Stack Tecnológica

- **Framework:** React Native + Expo SDK 52
- **Linguagem:** TypeScript
- **Navegação:** @react-navigation/native 7.x
- **Persistência:** @react-native-async-storage/async-storage
- **Arquitetura:** Clean Architecture (Presentation / Domain / Data / Infrastructure / Shared)

---

## 🚀 Como Rodar

```bash
# Entrar na pasta do projeto
cd FordGuardian

# Instalar dependências (se necessário)
npm install

# Rodar com Expo
npx expo start
```

**Credenciais mockadas para login:**
- Email: `felipe@example.com`
- Senha: `123456`

---

## 📁 Estrutura do Projeto

```
FordGuardian/
├── src/
│   ├── presentation/
│   │   ├── screens/        # 11 telas do app
│   │   ├── components/     # Componentes reutilizáveis
│   │   └── navigation/     # AppNavigator (Stack + Tabs)
│   ├── domain/
│   │   └── entities/        # User, Vehicle, Alert, Dealer
│   ├── data/
│   │   ├── repositories/   # VehicleRepository, AlertRepository, UserRepository
│   │   └── mocks/          # Dados mockados
│   ├── infrastructure/
│   │   └── storage/        # AsyncStorage Service
│   └── shared/
│       ├── theme/          # Cores, tipografia, espaçamento (Ford)
│       └── constants/       # Rotas e configuração
├── App.tsx
└── package.json
```

---

## 🎨 Paleta Visual Ford

| Cor | Hex | Uso |
|-----|-----|-----|
| Ford Blue | `#1B448C` | Primary |
| Ford Dark Blue | `#0D2240` | Header |
| Health Normal | `#2E7D32` | Verde |
| Health Attention | `#F57C00` | Laranja |
| Health Critical | `#C62828` | Vermelho |

---

## 🔄 Evolução Futura

- Backend real com API REST
- Autenticação JWT
- Banco de dados PostgreSQL/Firebase
- Notificações push (Firebase Cloud Messaging)
- Geolocalização real
- Modelo preditivo com Machine Learning

---

## 👥 Equipe

- Felipe Marques - RM: 123456

---

## 📝 Critérios de Avaliação

- ✅ Funcionalidade
- ✅ Qualidade técnica
- ✅ Documentação
- ✅ UX e Design
- ✅ Colaboração no Git

---

**Sprint:** Mobile Development & IoT - Ford x FIAP 2026