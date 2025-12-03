# Propipe Yönetim Mobile

Propipe Yönetim sisteminin React Native mobil uygulaması.

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Expo'yu başlat
npm start
```

## Geliştirme

```bash
# Android emülatör/cihazda çalıştır
npm run android

# iOS simülatörde çalıştır
npm run ios
```

## APK Build (EAS)

```bash
# EAS CLI yükle (henüz yoksa)
npm install -g eas-cli

# Expo hesabına giriş yap
eas login

# Preview APK build'i başlat
npm run build:apk
# veya
eas build -p android --profile preview
```

## Özellikler

- **Dashboard**: Şirket kasası, tersane bakiyeleri, gider trendi
- **Giderler**: Gider ekleme, düzenleme, filtreleme
- **Tersaneler**: Tersane yönetimi, hakediş dosyaları
- **Network**: CRM, müşteri takibi
- **Ortaklar**: Ortak hesapları, aylık özetler
- **Profil**: Tema değiştirme, çıkış

## Teknolojiler

- React Native + Expo
- TypeScript
- Firebase (Firestore, Auth)
- React Navigation
- Expo Vector Icons

## Proje Yapısı

```
src/
├── components/     # Yeniden kullanılabilir UI componentleri
├── config/         # Firebase ve diğer yapılandırmalar
├── context/        # React Context'leri (Auth, Theme)
├── navigation/     # React Navigation yapılandırması
├── screens/        # Uygulama ekranları
├── services/       # Firebase servis katmanı
├── theme/          # Tema ve stil tanımları
├── types/          # TypeScript tip tanımları
└── utils/          # Yardımcı fonksiyonlar
```
