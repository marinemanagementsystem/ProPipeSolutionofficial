# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Communicate in Turkish (Türkçe iletişim kur).

## Repository Structure

This is a monorepo containing the Pro Pipe Solution projects:

```
propipe-solutions/
├── management/
│   ├── web/              # Yönetim paneli web uygulaması (React + Vite)
│   └── mobile/           # Yönetim paneli mobil uygulama (React Native + Expo)
├── website/              # propipesolution.com resmi sitesi (statik HTML/CSS/JS)
└── CLAUDE.md
```

## Development Commands

### Management Web (React + Vite + TypeScript)
```bash
cd management/web
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build (tsc -b && vite build)
npm run lint       # ESLint check
npm run preview    # Preview production build
```

### Management Mobile (React Native + Expo)
```bash
cd management/mobile
npm install
npm start          # Start Expo server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator
```

APK build with EAS:
```bash
eas build -p android --profile preview
```

### Website (Official Site)
Static site - no build process. Deployed via FTP to `ftp.propipesolution.com:21`.
FTP details in `website/Propipesiteyonetim.md`.

## Architecture

### Tech Stack
- **Web**: React 19, TypeScript, Vite, Material-UI
- **Mobile**: React Native, Expo, React Navigation
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: Emotion CSS-in-JS (web)

### State Management
- Context API for auth (`AuthContext`) and theme (`ThemeContext`)
- Firebase Firestore as data source
- Role-based access: Admin, Ortak (Partner), Muhasebe (Accounting)

### Key Patterns
- Service layer abstraction via `firebaseService.ts`
- Protected routes with `ProtectedRoute` component
- Web base path: `/yonetim/` (configured in vite.config.ts)
- Functional components with React Hooks

### Firestore Collections
- `users` - User profiles and roles
- `projects` - Project/tersane data
- `partners` - Business contacts
- `expenses` - Transaction records
- `networkActions` - Sales pipeline
- `companyOverview` - Financial overview

## Project-Specific Notes

### Management Web Pages
- `/dashboard` - Main overview with KPIs
- `/expenses` - Expense management
- `/projects` - Project listing
- `/projects/:projectId` - Project details
- `/network` - Customer network tracking
- `/partners` - Partner management

### Mobile Navigation
Tab-based navigation with: Home, Expenses, Network, Profile, Projects screens.

### Deployments
- **Web**: propipesolution.com/yonetim/ (FTP deploy)
- **Website**: propipesolution.com (FTP deploy)
- **Mobile**: APK via EAS Build
