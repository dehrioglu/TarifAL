# Tarif AI

Modern mobil tarif ve market sipariş uygulaması. React Native + Expo + TypeScript ile geliştirildi; Firebase Auth, Firestore ve Storage bağlantısı hazırdır. Firebase bilgileri girilmediğinde uygulama demo veri ve mock auth ile çalışır.

## Özellikler

- Giriş ve kayıt ekranları
- Günün tarifi, kategori filtreleri ve tarif kartları
- Beğeni sistemi
- Tarif detayında malzemeler, hazırlanış adımları ve sepete ekleme
- Tarif ekleme formu, galeri görseli, AI görsel/video placeholder butonları
- Sepet, adet artır/azalt, silme, teslimat adresi ve mock sipariş onayı
- Profil, kullanıcı bilgisi, tariflerim, beğendiklerim ve çıkış
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
