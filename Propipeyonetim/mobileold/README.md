# Pro Pipe Mobile

Expo + React Native uygulaması. Firebase oturumu ile giriş yapar, şirket kasası ve proje özetlerini gösterir, son giderleri ve yaklaşan network aksiyonlarını listeler. Web uygulamasıyla aynı Firebase veritabanını kullanır.

## Özellikler
- E‑posta/şifre ile Firebase Auth girişi.
- Dashboard kartları: kasa, tersane bakiyesi, bu ay ödenen gider, ortak bakiyesi.
- Son giderler ve yaklaşan network görüşmeleri listesi.
- Proje, gider, network ve profil sekmeleri için tab bar navigasyon.

## Çalıştırma
```bash
cd mobile
npm install
npm start           # QR veya emülatör ile
npm run android     # Doğrudan Android emülatörü
```

## APK üretme (market dışı dağıtım)
1. Android projesini oluşturun (ilk ve tek sefer):
   ```bash
   cd mobile
   npx expo prebuild --platform android
   ```
2. İsteğe bağlı: `android/gradle.properties` içine kendi keystore bilgilerinizi ekleyerek imzalı derleme yapın. Eğer eklemezseniz, `assembleRelease` varsayılan debug anahtarı ile imzalar.
3. APK oluşturun:
   ```bash
   cd mobile/android
   ./gradlew assembleRelease   # Windows: gradlew.bat assembleRelease
   ```
4. Ortaya çıkan dosya: `mobile/android/app/build/outputs/apk/release/app-release.apk`  
   Bu dosyayı cihazlara doğrudan yan yükleyebilirsiniz (Google Play’e gerek yok).

## Notlar
- Firebase yapılandırması `src/firebase/config.ts` içindedir; web projesindeki anahtarla aynıdır.
- TypeScript kontrolü: `cd mobile && npx tsc --noEmit`
- Varsayılan Android paket adı: `com.propipesteel.mobile` (`app.json`).
