# Tarif AI

Modern mobil tarif ve market sipariş uygulaması. React Native + Expo + TypeScript ile geliştirildi; Firebase Auth, Firestore ve Storage bağlantısı hazırdır. Firebase bilgileri girilmediğinde uygulama demo veri ve mock auth ile çalışır.

## Özellikler

- Giriş ve kayıt ekranları
- Günün tarifi, kategori filtreleri ve tarif kartları
- Tariflerde süre, porsiyon, zorluk, kalori ve etiket bilgileri
- Gelişmiş arama: kategori, malzeme, süre, bütçe ve zorluk filtreleri
- AI malzeme önerisi: evdeki malzemelerle eşleşen tarif önerileri
- Beğeni sistemi
- Tarif detayında malzemeler, hazırlanış adımları, market muadili ve sepete ekleme
- Tarif ekleme formu, galeri görseli, AI görsel/video placeholder butonları
- Sepet, adet artır/azalt, silme, teslimat adresi, mock sipariş onayı ve sipariş geçmişi
- Profil, kullanıcı bilgisi, tariflerim, beğendiklerim, sipariş özeti ve çıkış
- Firebase koleksiyon hazırlığı: `users`, `recipes`, `ingredients`, `orders`, `likes`, `cart`

## Kurulum

```bash
npm install
npm run start
```

Expo açıldıktan sonra iPhone simülatörü, Android emülatörü veya Expo Go ile çalıştırabilirsin.

Web önizleme için:

```bash
npm run web
```

## Demo Giriş

Firebase config boşken herhangi geçerli e-posta ve en az 6 karakter şifreyle giriş yapılabilir. Hazır demo:

```text
test@tarifai.com
Test123!
```

## Firebase Ayarı

1. Firebase Console'da bir proje oluştur.
2. Authentication > Email/Password sağlayıcısını aç.
3. Firestore Database ve Storage servislerini etkinleştir.
4. `.env.example` dosyasını `.env` olarak çoğaltıp Firebase web app bilgilerini gir.
5. Uygulamayı yeniden başlat.

```bash
cp .env.example .env
```

Windows PowerShell için:

```powershell
Copy-Item .env.example .env
```

Firebase config girildiğinde uygulama Firestore'dan tarifleri, kullanıcının beğenilerini ve sipariş geçmişini çekmeye çalışır. Veri yoksa demo içerik korunur.

## Vercel'e Yükleme

Bu proje Expo web çıktısı için hazırlandı. Vercel ayarı [vercel.json](./vercel.json) içinde:

- Build command: `expo export -p web`
- Output directory: `dist`
- SPA rewrite: tüm yollar `/` adresine yönlenir

Yerelde üretim çıktısını almak için:

```bash
npm run export:web
```

Üretim çıktısını yerelde test etmek için:

```bash
npm run serve:web
```

Vercel CLI ile yüklemek için:

```bash
npm install -g vercel@latest
vercel login
vercel
```

Vercel panelinden yükleyeceksen:

1. Projeyi GitHub'a gönder.
2. Vercel'de New Project seç.
3. Framework Preset: Other
4. Build Command: `expo export -p web`
5. Output Directory: `dist`
6. Environment Variables bölümüne Firebase `EXPO_PUBLIC_...` değerlerini ekle.

## APK Build

```bash
eas build -p android --profile preview
```

Play Store için:

```bash
eas build -p android --profile production
```

## Proje Yapısı

```text
src/
  components/      Ortak UI bileşenleri
  constants/       Tema ve kategori sabitleri
  data/            Demo tarifler
  navigation/      Auth, tab ve root navigasyon
  screens/         Uygulama ekranları
  services/        Firebase Auth, Firestore, Storage servisleri
  store/           Zustand uygulama state'i
  types/           TypeScript modelleri
```

## Kontrol

```bash
npm run typecheck
```

Mock sipariş sistemi gerçek ödeme almaz; siparişler store içinde oluşturulur ve Firebase config varsa `orders` koleksiyonuna yazılır.
