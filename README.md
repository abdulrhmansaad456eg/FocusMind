# 🧠 FocusMind

> A premium focus & productivity app that helps you build better habits, track your wins, and stay motivated with your personal mascot, Remi.

[![Build APK](https://github.com/abdulrhmansaad456eg/FocusMind/actions/workflows/build-apk.yml/badge.svg)](https://github.com/abdulrhmansaad456eg/FocusMind/actions/workflows/build-apk.yml)

## ✨ Features

- **🔐 Auth & Profile** - Email/password signup with customizable avatar
- **🎓 Interactive Onboarding** - 6-step tutorial guided by Remi the mascot
- **⏱ Focus Sessions** - Pomodoro, Deep Work, Quick Burst, and Wind Down modes
- **🔥 Streaks System** - Track daily focus streaks with milestone rewards
- **💰 Focus Coins** - Earn and spend coins in the shop
- **🎵 Ambient Sounds** - Mix up to 3 sounds simultaneously
- **🏆 Achievements** - 30+ badges to unlock
- **📊 Statistics** - Track focus time with visualizations
- **🌍 Multi-language** - English, Korean, and Arabic with RTL support
- **🎨 6 Themes** - Dark, Light, OLED, Sunset, Matcha, Midnight Blue

## 🐣 Meet Remi

Remi is your personal focus companion - a playful, slightly wobbly creature who celebrates your wins and gently nudges you back on track. Remi makes ONE pun per interaction, then moves on. Short sentences, never lectures.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 51 + Expo Router v3 |
| Language | TypeScript |
| State Management | Zustand + MMKV |
| Animations | Reanimated 3 + Moti |
| i18n | i18next + react-i18next |
| Icons | Phosphor Icons |
| Charts | Victory Native |
| Build | EAS Build + GitHub Actions |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Clone the repository
git clone https://github.com/abdulrhmansaad456eg/FocusMind.git
cd FocusMind

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device

```bash
# iOS (requires macOS)
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Project Structure

```
FocusMind/
├── app/                     # Expo Router pages
│   ├── (auth)/              # Auth screens
│   ├── (onboarding)/        # Tutorial flow
│   ├── (tabs)/              # Main app tabs
│   └── session/             # Active session screens
├── components/
│   ├── ui/                  # Base UI components
│   └── remi/                # Remi mascot components
├── store/                   # Zustand stores
├── theme/                   # Theme definitions
├── i18n/                    # Translations
└── .github/workflows/       # CI/CD
```

## 🔧 Build Configuration

### GitHub Actions

The repository includes a GitHub Actions workflow that automatically builds an Android APK on every push to `main`.

**Required Secrets:**
- `EXPO_TOKEN` - Your Expo token from [expo.dev](https://expo.dev)

### EAS Build

Configure EAS build profiles in `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## 🌐 Localization

The app supports:
- 🇺🇸 English (en)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar) with full RTL layout

## 📝 License

MIT License - feel free to use this project for learning or as a starting point for your own apps.

---

Made with 💙 by the FocusMind team
