# Propipe Üretim Takip Sistemi - Proje Detayları

## 📋 Proje Özeti

Tersane projelerinde **Boru** ve **Teçhiz** departmanları için üretim takip sistemi. Web ve mobil (Android APK) platformlarında çalışır.

---

## 🏗️ Proje Yapısı

```
PropipeUretimTakip/
├── web/                          # React Web Uygulaması
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js       # Firebase yapılandırması
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Kimlik doğrulama context'i
│   │   ├── services/
│   │   │   └── firebaseService.js # Firebase CRUD işlemleri
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Giriş sayfası
│   │   │   ├── Dashboard.jsx     # Ana panel (Tersane/Proje/Departman)
│   │   │   ├── AdminPanel.jsx    # Yönetim paneli
│   │   │   ├── DepartmanPage.jsx # Departman yönlendirici
│   │   │   ├── TechizDepartman.jsx # Teçhiz iş takibi
│   │   │   └── BoruDepartman.jsx # Boru/Spool takibi
│   │   ├── App.jsx               # Ana uygulama ve routing
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global stiller
│   ├── package.json
│   ├── vite.config.js
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── mobile/                       # React Native Expo Uygulaması
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── firebaseService.js
│   │   └── screens/
│   │       ├── LoginScreen.js
│   │       ├── HomeScreen.js
│   │       ├── DepartmanScreen.js
│   │       ├── TechizScreen.js
│   │       └── BoruScreen.js
│   ├── App.js
│   ├── app.json
│   ├── eas.json                  # EAS Build yapılandırması
│   └── package.json
│
├── README.md
├── PROJE_DETAYLARI.md
└── .gitignore
```

---

## 🛠️ Teknoloji Stack

### Web Uygulaması
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| React | 19.1.0 | UI Framework |
| Vite | 7.2.6 | Build tool |
| Tailwind CSS | 4.x | Styling |
| React Router | 7.6.2 | Routing |
| Firebase | 11.10.0 | Backend (Firestore) |
| Lucide React | 0.511.0 | İkonlar |

### Mobil Uygulama
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| React Native | 0.79.3 | Mobile framework |
| Expo | ~53.0.0 | Development platform |
| React Navigation | 7.x | Navigation |
| Firebase | 11.10.0 | Backend |
| AsyncStorage | 2.1.2 | Local storage |
| EAS CLI | - | APK build |

---

## 🗄️ Veritabanı Yapısı (Firebase Firestore)

### Collections

#### 1. `users` - Kullanıcılar
```javascript
{
  id: "auto-generated",
  username: "admin",
  password: "admin123",        // Şifreli saklanmalı (production'da)
  name: "Admin",
  role: "admin" | "user",
  createdAt: Timestamp
}
```

#### 2. `tersaneler` - Tersaneler
```javascript
{
  id: "auto-generated",
  name: "Sanmar",
  createdAt: Timestamp
}
```

#### 3. `projeler` - Projeler
```javascript
{
  id: "auto-generated",
  name: "383",
  tersaneId: "tersane-doc-id",
  tersaneName: "Sanmar",
  createdAt: Timestamp
}
```

#### 4. `departmanlar` - Departmanlar
```javascript
{
  id: "auto-generated",
  name: "Boru" | "Teçhiz",
  type: "boru" | "techiz",
  projeId: "proje-doc-id",
  projeName: "383",
  tersaneId: "tersane-doc-id",
  tersaneName: "Sanmar",
  createdAt: Timestamp
}
```

#### 5. `techizIsler` - Teçhiz İşleri
```javascript
{
  id: "auto-generated",
  departmanId: "departman-doc-id",
  mahal: "E.R FWD YARD.MAK.D",
  uretimDurumu: "TAMAMLANDI",
  montajDurumu: "DEVAM_EDIYOR",
  kaynakDurumu: "BASLANMADI",
  aciklama: "Not...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 6. `boruIsler` - Boru İşleri (Spool)
```javascript
{
  id: "auto-generated",
  departmanId: "departman-doc-id",
  spoolNo: "SP-001",
  piececlass: "C1",
  imalat: 0 | 1,
  montaj: 0 | 1,
  ustaId: "usta-doc-id",
  ustaName: "İdris Palabıyık",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 7. `ustalar` - Ustalar
```javascript
{
  id: "auto-generated",
  name: "İdris Palabıyık",
  createdAt: Timestamp
}
```

---

## 🎨 Durum Kodları ve Renkleri

### Teçhiz Departmanı
| Durum | Kod | Renk |
|-------|-----|------|
| Başlanmadı | `BASLANMADI` | 🔴 Kırmızı |
| Devam Ediyor | `DEVAM_EDIYOR` | 🟡 Sarı |
| Final Aşamasında | `FINAL_ASAMASINDA` | 🩷 Pembe |
| Tersaneden Bekleniyor | `TERSANEDEN_BEKLENIYOR` | 🔵 Mavi |
| Tamamlandı | `TAMAMLANDI` | 🟢 Yeşil |
| N/A | `NA` | ⚫ Gri |

### Boru Departmanı
| Durum | İmalat | Montaj | Renk |
|-------|--------|--------|------|
| Yapılmamış | 0 | 0 | 🔴 Kırmızı |
| İmalat Tamam | 1 | 0 | 🟡 Sarı |
| Tamamlandı | 1 | 1 | 🟢 Yeşil |

---

## 🔐 Kimlik Doğrulama

### Varsayılan Kullanıcılar
| Kullanıcı Adı | Şifre | Rol |
|---------------|-------|-----|
| admin | admin123 | Admin |

### Roller ve Yetkiler
| Rol | Dashboard | Departman | Admin Panel |
|-----|-----------|-----------|-------------|
| Admin | ✅ | ✅ Tam yetki | ✅ |
| User | ✅ | ✅ Sadece görüntüleme | ❌ |

---

## 📱 Sayfa/Ekran Detayları

### Web Sayfaları

#### 1. Login (`/login`)
- Kullanıcı adı ve şifre ile giriş
- Hata mesajı gösterimi
- Loading durumu

#### 2. Dashboard (`/`)
- Tersane listesi (Sanmar, Sefine)
- Tersane seçimi → Proje listesi
- Proje seçimi → Departman listesi
- Breadcrumb navigasyon
- Sidebar menü

#### 3. Departman Sayfası (`/departman/:id`)
- Departman tipine göre yönlendirme
- Boru → BoruDepartman
- Teçhiz → TechizDepartman

#### 4. Teçhiz Departmanı
- Tablo görünümü (Mahal, Üretim, Montaj, Kaynak durumu)
- Durum değiştirme dropdown'ları
- Yeni iş ekleme
- İş silme
- CSV export
- İstatistikler

#### 5. Boru Departmanı
- Spool listesi
- Hızlı İmalat/Montaj toggle (0/1)
- Usta atama
- Renk kodlu durum gösterimi
- Yeni spool ekleme
- CSV export

#### 6. Admin Panel (`/admin`)
- Kullanıcı yönetimi (CRUD)
- Tersane yönetimi (CRUD)
- Proje yönetimi (CRUD)
- Departman yönetimi (CRUD)
- Usta yönetimi (CRUD)
- Veri sıfırlama butonu

---

## 🔧 Firebase Yapılandırması

```javascript
// config/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyApOmJUX2keAH9hS8nqwHOEKJpNuOArLsE",
  authDomain: "propipeuretimtakip.firebaseapp.com",
  projectId: "propipeuretimtakip",
  storageBucket: "propipeuretimtakip.firebasestorage.app",
  messagingSenderId: "936aborayır824508392",
  appId: "1:936824508392:web:c4f7d8e4a1b2c3d4e5f6"
};
```

---

## 🚀 Kurulum ve Çalıştırma

### Web Uygulaması

```bash
# Proje dizinine git
cd PropipeUretimTakip/web

# Bağımlılıkları yükle
npm install

# Development sunucusu başlat
npm run dev

# Production build
npm run build
```

### Mobil Uygulama

```bash
# Proje dizinine git
cd PropipeUretimTakip/mobile

# Bağımlılıkları yükle
npm install

# Expo development başlat
npx expo start

# APK Build (EAS)
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

---

## 📦 APK Oluşturma

### EAS Yapılandırması (`eas.json`)
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### APK Build Komutları
```bash
# Preview APK (test için)
eas build -p android --profile preview

# Production APK
eas build -p android --profile production
```

---

## 🌐 Deployment

### Web (Vercel/Netlify)
```bash
# Build
npm run build

# dist/ klasörünü deploy et
```

### Firebase Hosting
```bash
# Firebase CLI yükle
npm install -g firebase-tools

# Login
firebase login

# Init
firebase init hosting

# Deploy
firebase deploy
```

---

## 📊 Veri Hiyerarşisi

```
Tersane (Sanmar, Sefine)
└── Proje (383, 367, 368, 387, 404)
    └── Departman
        ├── Boru
        │   └── Spool İşleri
        │       ├── Spool No
        │       ├── Piececlass
        │       ├── İmalat (0/1)
        │       ├── Montaj (0/1)
        │       └── Usta
        │
        └── Teçhiz
            └── Teçhiz İşleri
                ├── Mahal
                ├── Üretim Durumu
                ├── Montaj Durumu
                ├── Kaynak Durumu
                └── Açıklama
```

---

## 🔄 API Fonksiyonları (firebaseService.js)

### Users
- `getUsers()` - Tüm kullanıcıları getir
- `createUser(data)` - Yeni kullanıcı oluştur
- `updateUser(id, data)` - Kullanıcı güncelle
- `deleteUser(id)` - Kullanıcı sil

### Tersaneler
- `getTersaneler()` - Tüm tersaneleri getir
- `createTersane(data)` - Yeni tersane oluştur
- `updateTersane(id, data)` - Tersane güncelle
- `deleteTersane(id)` - Tersane sil

### Projeler
- `getProjeler(tersaneId?)` - Projeleri getir
- `createProje(data)` - Yeni proje oluştur
- `updateProje(id, data)` - Proje güncelle
- `deleteProje(id)` - Proje sil

### Departmanlar
- `getDepartmanlar(projeId?)` - Departmanları getir
- `createDepartman(data)` - Yeni departman oluştur
- `deleteDepartman(id)` - Departman sil

### Teçhiz İşleri
- `getTechizIsler(departmanId)` - Teçhiz işlerini getir
- `createTechizIs(data)` - Yeni teçhiz işi oluştur
- `updateTechizIs(id, data)` - Teçhiz işi güncelle
- `deleteTechizIs(id)` - Teçhiz işi sil
- `bulkCreateTechizIs(items)` - Toplu ekleme

### Boru İşleri
- `getBoruIsler(departmanId)` - Boru işlerini getir
- `createBoruIs(data)` - Yeni boru işi oluştur
- `updateBoruIs(id, data)` - Boru işi güncelle
- `deleteBoruIs(id)` - Boru işi sil
- `bulkCreateBoruIs(items)` - Toplu ekleme

### Ustalar
- `getUstalar()` - Tüm ustaları getir
- `createUsta(data)` - Yeni usta oluştur
- `updateUsta(id, data)` - Usta güncelle
- `deleteUsta(id)` - Usta sil

### Utility
- `cleanupAllData()` - Tüm verileri sil
- `seedInitialData()` - Varsayılan verileri oluştur

---

## 🎯 Özellikler Özeti

### ✅ Tamamlanan
- [x] Kullanıcı girişi (username/password)
- [x] Admin ve User rolleri
- [x] Tersane → Proje → Departman hiyerarşisi
- [x] Teçhiz departmanı iş takibi
- [x] Boru departmanı spool takibi
- [x] Durum renk kodlaması
- [x] Admin paneli (CRUD işlemleri)
- [x] Veri sıfırlama
- [x] Mobil uygulama altyapısı
- [x] APK build yapılandırması
- [x] Firebase entegrasyonu
- [x] Dark tema tasarım

### 🔜 Geliştirilebilir
- [ ] Şifre hash'leme (bcrypt)
- [ ] Firebase Authentication entegrasyonu
- [ ] Push notification
- [ ] Offline mode (mobil)
- [ ] Excel import/export
- [ ] Raporlama modülü
- [ ] Fotoğraf ekleme
- [ ] QR kod ile spool takibi

---

## 📞 İletişim

**Repository:** https://github.com/marinemanagementsystem/propipeuretimtakip

---

## 📄 Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır.

---

*Son güncelleme: 1 Aralık 2025*
