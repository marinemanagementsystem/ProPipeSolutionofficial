# Propipe Üretim Takip Sistemi

Tersane projelerinde Boru ve Teçhiz departmanları için üretim takip sistemi.

## 🚀 Özellikler

### Web Uygulaması
- ✅ Kullanıcı girişi (Admin/Kullanıcı)
- ✅ Tersane → Proje → Departman hiyerarşisi
- ✅ Teçhiz departmanı: Üretim, Montaj, Kaynak durumu takibi
- ✅ Boru departmanı: Spool bazlı İmalat/Montaj takibi
- ✅ İstatistik ve raporlama
- ✅ CSV export
- ✅ Admin paneli (Kullanıcı, Tersane, Proje, Departman, Usta yönetimi)

### Mobil Uygulama (Android APK)
- ✅ Kullanıcı girişi
- ✅ Tersane → Proje → Departman navigasyonu
- ✅ İş durumu güncelleme
- ✅ Hızlı İmalat/Montaj toggle
- ✅ İstatistik görüntüleme

## 📋 Kurulum

### Web Uygulaması

```bash
cd web
npm install
npm run dev
```

Web uygulaması `http://localhost:5173` adresinde çalışacaktır.

### Mobil Uygulama

```bash
cd mobile
npm install
npx expo start
```

### APK Oluşturma

```bash
cd mobile
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## 🔐 Varsayılan Giriş Bilgileri

İlk çalıştırmada otomatik oluşturulan admin hesabı:
- **Kullanıcı Adı:** admin
- **Şifre:** admin123

## 📊 Veritabanı Yapısı (Firebase Firestore)

### Collections:
- `users` - Kullanıcılar
- `tersaneler` - Tersaneler
- `projeler` - Projeler
- `departmanlar` - Departmanlar (Boru/Teçhiz)
- `techizIsler` - Teçhiz işleri
- `boruIsler` - Boru işleri (Spool)
- `ustalar` - Ustalar

## 🎨 Durum Renkleri

### Teçhiz:
- 🔴 BAŞLANMADI
- 🟡 DEVAM EDİYOR
- 🩷 FİNAL AŞAMASINDA YAPILACAK
- 🔵 TERSANEDEN BEKLENİYOR
- 🟢 TAMAMLANDI
- ⚫ N/A

### Boru:
- 🔴 İmalat ve Montaj yapılmamış
- 🟡 İmalat yapılmış, Montaj yapılmamış
- 🟢 Montaj tamamlanmış

## 🛠️ Teknolojiler

### Web
- React + Vite
- Tailwind CSS
- Firebase Firestore
- React Router
- Lucide Icons

### Mobil
- React Native + Expo
- React Navigation
- Firebase Firestore
- AsyncStorage

## 📱 APK Yükleme

1. APK dosyasını Android cihazınıza aktarın
2. Ayarlar > Güvenlik > Bilinmeyen Kaynaklar'ı etkinleştirin
3. APK dosyasına tıklayıp yükleyin

## 📝 Lisans

Bu proje özel kullanım içindir.
