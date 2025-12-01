# Pro Pipe Solution Site Yönetimi

## 🌐 Site Bilgileri
- **Canlı Site:** http://propipesolution.com
- **Yerel Dosyalar:** `c:\dev\PPSSofficial\Resmi\`

---

## 📁 FTP Bağlantı Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Host** | `ftp.propipesolution.com` |
| **IP Adresi** | `85.235.74.127` |
| **Kullanıcı Adı** | `yonetim@propipesolution.com` |
| **Şifre** | `kk197-xJ?.` |
| **Port** | `21` |
| **Protokol** | FTP |
| **Hedef Klasör** | `/public_html/` |

---

## 🚀 FTP ile Dosya Yükleme Komutları

### Tek Dosya Yükleme
```bash
cd /c/dev/PPSSofficial/Resmi
curl -T <dosya_adı> -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/"
```

### Örnekler:

**index.html yükle:**
```bash
curl -T index.html -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/"
```

**style.css yükle:**
```bash
curl -T style.css -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/"
```

**script.js yükle:**
```bash
curl -T script.js -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/"
```

**images klasörüne resim yükle:**
```bash
curl -T "images/resim.jpg" --ftp-create-dirs -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/images/"
```

### Tüm Ana Dosyaları Yükle
```bash
cd /c/dev/PPSSofficial/Resmi && \
curl -T index.html -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/" && \
curl -T style.css -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/" && \
curl -T script.js -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/" && \
curl -T admin.html -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/" && \
curl -T admin.js -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/" && \
curl -T social_links.json -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/" && \
curl -T logo.png -u "yonetim@propipesolution.com:kk197-xJ?." "ftp://85.235.74.127/public_html/"
```

---

## 📂 Site Dosya Yapısı

```
public_html/
├── index.html          # Ana sayfa
├── style.css           # Stil dosyası
├── script.js           # JavaScript dosyası
├── admin.html          # Yönetim paneli
├── admin.js            # Yönetim paneli JS
├── social_links.json   # Sosyal medya linkleri
├── logo.png            # Logo
└── images/             # Resimler klasörü
    ├── 1.jpg
    ├── about-image.jpg
    ├── boru.jpg
    ├── boru 2.jpg
    ├── logo.png
    ├── quality-image.jpg
    └── techiz.jpg
```

---

## 🔧 cPanel Bilgileri

- **cPanel URL:** https://propipesolution.com:2083 (veya hosting sağlayıcı paneli)
- **FTP Yönetimi:** cPanel → FTP Hesapları

---

## ⚠️ Önemli Notlar

1. **DNS Sorunu:** Eğer `ftp.propipesolution.com` çözümlenemezse, IP adresi `85.235.74.127` kullanın.
2. **Boşluklu dosya isimleri:** Tırnak içinde yazın: `"images/boru 2.jpg"`
3. **Yeni klasör oluşturma:** `--ftp-create-dirs` parametresi ekleyin
4. **Şifredeki özel karakterler:** Şifre tırnak içinde olmalı

---

## 🔗 GitHub Repo (Yedek)

- **Repo:** https://github.com/marinemanagementsystem/ProPipeSolutionofficial
- **GitHub Pages:** https://marinemanagementsystem.github.io/ProPipeSolutionofficial/

---

*Son güncelleme: 1 Aralık 2025*
