# Run Quest — React Native + Expo

Versão mobile do projeto **Run Quest** (anteriormente Urban Speed), convertida de React/Web para React Native com Expo Router.

## Tech Stack

| Categoria | Tecnologia |
|---|---|
| Framework | **React Native** + **TypeScript** |
| Build/Routing | **Expo SDK 52** + **Expo Router v4** |
| Mapas | **@rnmapbox/maps** (Mapbox GL para React Native) |
| GPS | **expo-location** |
| Backend/Auth | **Supabase** (mesmo do projeto web) |
| Multiplayer | **Supabase Realtime Broadcast** |
| Armazenamento seguro | **expo-secure-store** |

---

## Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Conta no [Supabase](https://supabase.com) (mesma do projeto web)
- Conta no [Mapbox](https://mapbox.com) com:
  - **Public token** (começa com `pk.`) → usado no app
  - **Secret token** (começa com `sk.`) → usado para baixar o SDK nativo do Mapbox
- Android Studio ou Xcode instalado (necessário para build nativo)

---

## Setup

### 1. Instalar dependências

```bash
cd run-app
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
EXPO_PUBLIC_SUPABASE_URL=https://sua-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
EXPO_PUBLIC_MAPBOX_TOKEN=pk.sua_chave_publica_mapbox
```

### 3. Configurar o token secreto do Mapbox

No arquivo `app.json`, substitua `YOUR_MAPBOX_SECRET_TOKEN_HERE` pelo seu token secreto do Mapbox (necessário para baixar o SDK nativo):

```json
["@rnmapbox/maps", { "RNMapboxMapsDownloadToken": "sk.eyJ1Ijo..." }]
```

> ⚠️ **Importante:** Este token secreto fica no `app.json` apenas durante o build e **não** é incluído no APK/IPA final. O token público (`pk.`) é o que o app usa em runtime.

---

## Executar o app

Este projeto usa módulos nativos (`@rnmapbox/maps`, `expo-location`) e **não funciona no Expo Go**. É necessário um **development build**.

### Android

```bash
npx expo run:android
```

### iOS

```bash
npx expo run:ios
```

### Build via EAS (recomendado para distribuição)

```bash
npx eas build --platform android --profile development
npx eas build --platform ios --profile development
```

---

## Estrutura do projeto

```
run-app/
├── app/
│   ├── _layout.tsx          # Root layout (providers + auth gate)
│   ├── +not-found.tsx       # Tela 404
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx        # Tela de login/cadastro
│   └── (app)/
│       ├── _layout.tsx
│       ├── index.tsx        # Dashboard (perfil, stats, XP)
│       └── run.tsx          # Mapa de corrida com GPS
├── components/              # (vazio ou componentes compartilhados futuros)
├── contexts/
│   └── AuthContext.tsx      # Autenticação global (Supabase)
├── hooks/
│   └── useMultiplayer.ts    # Sincronização em tempo real
├── lib/
│   └── supabase.ts          # Cliente Supabase configurado para RN
├── constants/
│   └── colors.ts            # Paleta de cores cyberpunk
├── app.json                 # Configuração Expo
├── babel.config.js
├── metro.config.js
└── tsconfig.json
```

---

## Funcionalidades

- **Autenticação** — Login e cadastro com Supabase Auth (sessão persistida com expo-secure-store)
- **Dashboard** — Perfil do corredor, nível, XP, estatísticas
- **Mapa de corrida livre** — Satélite + ruas (estilo próximo a jogos), GPS, câmera em 3ª pessoa para corrida a pé
- **Start / Stop** — Início e fim da corrida com tempo e distância
- **Multiplayer** — Outros corredores em tempo real via Supabase Realtime (raio de 5km)
- **Modal de jogador** — Tap no marcador para ver nível, status e distância

---

## Diferenças em relação à versão web

| Aspecto | Web | Mobile |
|---|---|---|
| Roteamento | React Router DOM | Expo Router (file-based) |
| Mapas | Mapbox GL JS | @rnmapbox/maps |
| GPS | `navigator.geolocation` | `expo-location` |
| Avatar | React Three Fiber (DOM) | Ícone simples (leve) |
| Auth storage | localStorage | expo-secure-store |
| Env vars | `VITE_` prefix | `EXPO_PUBLIC_` prefix |
| UI Components | shadcn/ui + Tailwind | StyleSheet nativo (tema cyberpunk) |
