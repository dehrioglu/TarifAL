# TarifAL

Modern mobil tarif ve market sipariş uygulaması. React Native + Expo + TypeScript ile geliştirildi; Firebase Auth ve Firestore bağlantısı hazırdır. Firebase Storage bu sürümde kullanılmaz; görseller hazır asset, dış imageURL veya placeholder mantığıyla çalışır. Firebase bilgileri girilmediğinde uygulama doğrudan kullanılabilir Demo Modu ile çalışır.

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
- Gerçek hesaplarda kullanıcıya özel Firestore kalıcılığı: `users/{userId}/favorites` ve `users/{userId}/cart`
- Firebase oturum geri yükleme ve Demo Modu ayrımı
- Beta yayın ölçümleme altyapısı: `analyticsEvents`, kritik aksiyon takibi ve kurucu paneli

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

## Demo Modu

Firebase config boşken uygulama ana ekranda Demo Modu ile açılır. Profil ekranındaki `Gerçek Hesaba Geç` butonuyla giriş ekranı da görülebilir. Hazır demo:

```text
test@tarifai.com
Test123!
```

## Firebase Ayarı

1. Firebase Console'da bir proje oluştur.
2. Authentication > Email/Password sağlayıcısını aç.
3. Firestore Database servisini etkinleştir. Storage bu sürümde zorunlu değildir.
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

Gerçek hesap akışında kullanılan yapı:

```text
users/{userId}
users/{userId}/favorites/{recipeId}
users/{userId}/cart/{itemId}
recipes/{recipeId}
orders/{orderId}
```

Tarif görselleri bu sürümde Firebase Storage'a yüklenmez. Tarif paylaşırken dış görsel URL'si girilebilir; URL yoksa mevcut premium placeholder kullanılır. Profil ve sponsorlu ürün görselleri de `photoURL` / `imageURL` alanı veya placeholder mantığıyla gösterilir.

## Firebase Güvenlik Kuralları

Projede başlangıç güvenlik kuralları hazırdır:

```text
firestore.rules
firebase.json
```

Firebase CLI ile kendi projene bağlandıktan sonra kuralları yayınlamak için:

```bash
firebase deploy --only firestore:rules
```

Web dağıtımında Vercel Environment Variables alanına, mobil geliştirmede yerel `.env` dosyasına `.env.example` içindeki `EXPO_PUBLIC_FIREBASE_...` değerlerini ekle.

## Beta Yayın ve Ölçümleme

TarifAL MVP beta yayınında kritik ürün hareketleri Firestore'daki `analyticsEvents` koleksiyonuna yazılır. Firebase config yoksa uygulama Demo Modu ile çalışmaya devam eder; config aktifse olaylar arka planda kaydedilir.

Takip edilen temel olaylar:

```text
user_registered
user_logged_in
user_logged_out
recipe_opened
recipe_favorited
recipe_unfavorited
missing_items_added_to_cart
cart_item_added
cart_item_removed
smart_cart_created
checkout_demo_started
checkout_demo_completed
recipe_shared
ai_chef_opened
demo_mode_used
real_account_used
beta_joined
feedback_submitted
mini_survey_answered
```

Her event minimum şu alanlarla saklanır:

```text
eventName
userId
userEmail
recipeId
recipeTitle
cartTotal
sourceScreen
isDemoMode
extraData
createdAt
```

Kurucu hesabı `kervankayaenes@gmail.com` ile giriş yaptığında Profil ekranında `Kurucu Paneli` görünür. Bu panel toplam kullanıcı, toplam event, tarif açılma, favori, sepete dönüşüm, checkout tamamlama, ortalama sepet, demo/gerçek hesap oranı ve en çok açılan/favorilenen tarifleri özetler.

Profil ekranındaki `Beta Test Rehberi` butonu, test kullanıcısını kayıttan tarif açmaya, favoriye, eksikleri sepete eklemeye, demo checkout'a ve pişirme moduna kadar yönlendiren kontrollü bir test akışı açar.

## Kapalı Beta Feedback Loop

Profil ekranındaki `Beta’ya Katıl` butonu kapalı beta rozetini aktif eder. Beta davet kodları uygulama içinde veya repoda paylaşılmaz; kodlar yalnızca kurucu/ekip tarafından test kullanıcısına iletilir.

Gerçek hesapta başarılı giriş sonrası `users/{userId}` dokümanına şu alanlar yazılır:

```text
isBetaTester
betaCode
betaJoinedAt
updatedAt
```

Demo Modu'nda beta rozeti lokal olarak gösterilir; Firestore'a gerçek kullanıcı profili yazılmaz.

Uygulama içi geri bildirim sistemi şu ekranlarda kullanılabilir:

```text
HomeScreen
RecipeDetail
CartScreen
ProfileScreen
AiChefChat
MarketCheckout
AddRecipe
```

Feedback kayıtları `feedback` koleksiyonuna yazılır:

```text
userId
userEmail
userName
screenName
feedbackType
message
rating
isBetaTester
isDemoMode
createdAt
appVersion
extraData
```

Mini anket cevapları `miniSurveyResponses` koleksiyonuna yazılır. Aynı kullanıcıya aynı soru sürekli gösterilmemesi için cevaplanan/atlanılan sorular cihazda işaretlenir.

Kurucu panelindeki `Beta Geri Bildirimleri` bölümü şunları özetler:

- Beta kullanıcı sayısı
- Toplam feedback sayısı
- Ortalama memnuniyet skoru
- En çok feedback gelen ekran
- En çok beğenilen ekran
- En çok hata bildirilen ekran
- En çok anlaşılmayan ekran
- Son 10 geri bildirim
- Mini anket cevap dağılımı
- Market siparişinde kullanma niyeti

Kapalı beta manuel test listesi:

1. Profil ekranından kurucudan aldığın beta davet kodunu gir ve `Beta Test Kullanıcısı` rozetini kontrol et.
2. Yanlış beta kodunda kullanıcı dostu hata çıktığını doğrula.
3. Bir tarif aç ve tarif ekranı mini anketini cevapla.
4. Tarifi favoriye ekle.
5. Eksik ürünleri sepete ekle ve mini anketi cevapla.
6. Sepet ekranındaki `Geri bildirim` butonuyla not gönder.
7. Demo checkout akışını tamamla ve market siparişi niyet anketini cevapla.
8. Tarif paylaş ve paylaşım mini anketini cevapla.
9. `feedback_submitted` ve `mini_survey_answered` eventlerinin yazıldığını kontrol et.
10. Kurucu hesabıyla panelde feedback metriklerini kontrol et.

Beta yayına çıkmadan önce:

1. Firebase Authentication Email/Password sağlayıcısını aç.
2. Firestore servisini etkinleştir. Storage ücretsiz sürümde kapalı kalabilir.
3. `.env` içindeki `EXPO_PUBLIC_FIREBASE_...` değerlerini doldur.
4. Firestore kurallarını yayınla.
5. `npm run typecheck` ve `npm run export:web` komutlarını temiz çalıştır.
6. Vercel Environment Variables alanına aynı Firebase değerlerini ekle.
7. En az bir gerçek hesapla beta rehberindeki 10 adımı tamamla.
8. Kurucu hesabıyla Profil ekranından metriklerin geldiğini kontrol et.

## Kapalı Beta Yayın Hazırlığı

Bu sprintte yeni büyük özellik eklemek yerine TarifAL MVP'si kapalı beta ve yatırımcı demosu için kilitlenir.

Beta yayın hedefi:

- 10-20 kişilik kapalı beta testine hazır web ve APK deneyimi
- Web demo linki paylaşılabilir yapı
- Android APK / EAS preview build hazırlığı
- Beta kodları, feedback ve mini anketlerin çalışması
- Kurucu panelinde karar verdiren metriklerin görünmesi
- Favori, sepet, profil ve feedback verilerinin gerçek hesapta kalıcı olması

Tek link demo paketi:

```text
BETA_DEMO_PACKAGE.md
```

Manuel kapalı beta test listesi:

```text
TEST_CHECKLIST.md
```

Önerilen web demo link alanı:

```text
https://tarif-ai.vercel.app
```

Demo kullanıcı bilgisi README veya sunum paketinde gerçek şifreyle tutulmamalıdır:

```text
demo@tarifal.app / Şifreyi kurucudan isteyin
```

Vercel production deploy öncesi önerilen komut akışı:

```powershell
cd "C:\Users\kullanıcı\Documents\New project\TarifAI"
npm run typecheck
npm run export:web
git status
git add .
git commit -m "Kapali beta yayin hazirligi"
git push
vercel --prod
```

## Sipariş Takip Admin Paneli

Kurucu hesabı `kervankayaenes@gmail.com` ile giriş yaptığında Profil ekranındaki `Kurucu Paneli` içinde `Siparişler` bölümü görünür. Bu panel Firestore `orders` koleksiyonundaki demo/gerçek siparişleri operasyon paneli gibi takip etmek için hazırlanmıştır.

Orders koleksiyon yapısı:

```text
orders/{orderId}
orderId
orderNumber
userId
userEmail
userName
items
relatedRecipes
marketName
subtotal
deliveryFee
discount
total
status
isDemoOrder
isPaid
paymentStatus
userNote
createdAt
updatedAt
completedAt
```

Sipariş status değerleri:

```text
new
preparing
on_the_way
completed
cancelled
```

Ödeme status değerleri:

```text
demo
pending
paid
failed
refunded
```

Demo siparişlerde varsayılan değerler:

```text
isDemoOrder: true
paymentStatus: demo
isPaid: false
status: new
```

Admin panelde görünen özetler:

- Bugünkü sipariş
- Toplam sipariş
- Bekleyen sipariş
- Hazırlanıyor
- Teslimatta
- Tamamlandı
- İptal edildi
- Ortalama sepet tutarı
- Toplam demo ciro

Admin panel aksiyonları:

- Sipariş no, kullanıcı adı/e-posta, status, market, demo/gerçek ve tarih filtresiyle arama
- Duruma göre kanban görünümü
- Sipariş kartından detay modalı açma
- Ürün listesi, ilgili tarifler, ödeme ve fiyat kırılımını görme
- Sipariş durumunu `Yeni`, `Hazırlanıyor`, `Teslimatta`, `Tamamlandı`, `İptal edildi` olarak güncelleme

Admin status güncellemesi şu eventleri yazar:

```text
order_status_updated
order_completed
order_cancelled
```

Akıllı Sipariş demosu tamamlandığında şu event yazılır:

```text
order_created
```

Firestore rules hedefi:

- Kullanıcı kendi siparişini oluşturabilir.
- Kullanıcı sadece kendi siparişlerini okuyabilir.
- Kullanıcı sipariş status değiştiremez.
- Kurucu/admin tüm siparişleri okuyabilir.
- Kurucu/admin sipariş status güncelleyebilir.

Sipariş takip manuel test listesi:

1. Akıllı Sipariş demosunu tamamla.
2. Başarı modalında sipariş numarasını kontrol et.
3. Firebase `orders` koleksiyonunda sipariş kaydı oluştu mu bak.
4. Kurucu email ile Profil > Kurucu Paneli > Siparişler bölümünü aç.
5. Kanban kolonlarında sipariş listeleniyor mu kontrol et.
6. Sipariş kartına basıp detay modalını aç.
7. Durumu `Hazırlanıyor` yap ve Firestore'da `status` güncellendi mi bak.
8. Durumu `Tamamlandı` yap ve `completedAt` yazıldı mı kontrol et.
9. `analyticsEvents` içinde `order_created`, `order_status_updated`, `order_completed` eventlerini kontrol et.
10. Normal kullanıcı hesabında Siparişler admin bölümü görünmüyor mu kontrol et.

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

## Android APK / Preview Build

Android test seçenekleri:

- Expo Go ile test
- EAS preview APK build

EAS CLI kurulumu ve preview APK build:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

Projede `eas.json` içinde preview profil hazırdır:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

Not: Bu MVP sprintinde Play Store yayını yapılmaz. Kapalı beta için APK/preview build hazırlanır.

## Proje Yapısı

```text
src/
  components/      Ortak UI bileşenleri
  constants/       Tema ve kategori sabitleri
  data/            Demo tarifler
  navigation/      Auth, tab ve root navigasyon
  screens/         Uygulama ekranları
  services/        Firebase Auth, Firestore ve ücretsiz görsel URL/placeholder servisleri
  store/           Zustand uygulama state'i
  types/           TypeScript modelleri
```

## Markalı Öneriler ve Sponsorlu Ürünler

TarifAL sponsorlu ürünleri reklam alanı gibi değil, kullanıcının tarif veya sepet ihtiyacına göre gösterilen doğal öneriler olarak işler.

- Demo ürün verisi: `src/data/demoSponsoredProducts.ts`
- Eşleştirme ve event takibi: `src/services/sponsoredPlacementService.ts`
- Ortak öneri kartı: `src/components/SponsoredProductCard.tsx`
- Göründüğü alanlar: tarif detayı, TarifAL Sepet, AI Şef ve Keşfet koleksiyonu
- Kurucu metriği: admin panelindeki `Marka İş Birlikleri` bölümü

Takip edilen demo eventleri:

- `sponsored_impression`
- `sponsored_click`
- `sponsored_added_to_cart`
- `sponsored_collection_opened`
- `sponsored_alternative_viewed`

Gerçek entegrasyonda aynı model marka kampanya paneline, Firestore koleksiyonuna veya market ürün API'sine bağlanabilir.

## Kontrol

```bash
npm run typecheck
```

Mock sipariş sistemi gerçek ödeme almaz. Gerçek hesap aktifse demo sipariş kayıtları `orders` koleksiyonuna yazılır; Demo Modu hiçbir gerçek sipariş veya ödeme oluşturmaz.

## Production Firebase Hazirligi

TarifAL production beta akisi Firebase Auth ve Firestore uzerinde tek merkezden calisir. Firebase Storage bu surumde kullanilmaz. Gercek anahtarlar repoya yazilmaz; yerel `.env` ve Vercel Environment Variables icinde tutulur.

### Environment Degiskenleri

Expo uygulamasi `EXPO_PUBLIC_FIREBASE_...` degiskenlerini okur. `.env.example` dosyasi bos placeholder degerlerle hazirdir. Vite tabanli ayri bir web kabugu eklenirse `VITE_FIREBASE_...` placeholderlari kullanilabilir.

`EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` opsiyoneldir. Storage kapali modda bos kalabilir ve uygulama hata vermez.

### Demo Mode / Gercek Hesap Ayrimi

- Demo Mode lokal/demo state ile calisir ve `users/{uid}` altina veri yazmaz.
- Gercek hesapta favoriler `users/{userId}/favorites`, sepet `users/{userId}/cart`, siparisler `orders` koleksiyonuna yazilir.
- Feedback ve analytics servisleri demo kullanicida Firestore'a yazmaz; gercek kullanicida `isDemoMode: false` ile kayit olusturur.
- Siparis akisi halen odeme almayan test/simulasyon akisi olarak isaretlenir: `paymentStatus: demo`, `isPaid: false`, `isDemoOrder: true`.

### Firestore Koleksiyonlari

- `users/{userId}`: `displayName`, `email`, `photoURL`, `nutritionGoal`, `isBetaTester`, `role`, `createdAt`, `updatedAt`
- `users/{userId}/favorites/{recipeId}`: `recipeId`, `title`, `imageURL`, `savedAt`, `updatedAt`
- `users/{userId}/cart/{itemId}`: `itemId`, `name`, `quantity`, `price`, `sourceRecipeId`, `createdAt`, `updatedAt`
- `orders/{orderId}`: `orderNumber`, `userId`, `items`, `relatedRecipes`, `marketName`, `subtotal`, `deliveryFee`, `discount`, `total`, `status`, `isDemoOrder`, `paymentStatus`, `isPaid`, `createdAt`, `updatedAt`, `completedAt`
- `recipes/{recipeId}`: public read, signed-in create, owner/admin update
- `feedback`, `miniSurveyResponses`, `analyticsEvents`: signed-in real users write; admin/founder read
- `sponsoredProducts`: public read; admin/founder write

### Admin / Founder Yetkileri

Kurucu email: `kervankayaenes@gmail.com`. Uygulamada `isFounderUser` ve `isAdminUser` yardimcilari kullanilir. Firestore rules tarafinda `users/{uid}.role` alanlari `user`, `admin`, `founder` olarak desteklenir. Production'da admin/founder yetkileri icin Firebase custom claims kullanilmasi onerilir.

### Firebase Rules Yayini

```bash
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules
```

Firebase Storage ileride Blaze plana gecilerek aktif edilirse Storage rules ayrica eklenip `firebase deploy --only storage` komutu kullanilabilir. Bu surumde zorunlu degildir.

Firestore sorgu performansi icin panelde index uyarisi gorulurse Firebase Console'un verdigi index linkiyle `firestore.indexes.json` dosyasi ayrica eklenebilir.

### Vercel Deploy

Vercel'de ayni `EXPO_PUBLIC_FIREBASE_...` degiskenleri tanimli olmalidir. Build komutu `expo export -p web`, cikti dizini `dist` olarak kalir.

### Bilinen Sinirlamalar

- Gercek odeme ve gercek market API entegrasyonu yoktur.
- Siparisler beta/demo operasyon verisi olarak kaydedilir.
- Firebase Storage kapali oldugu icin dosya upload yoktur; gorseller URL veya placeholder ile calisir.

## Firebase Kalıcılık Manuel Testi

1. Profil ekranından `Gerçek Hesaba Geç` seçeneğini aç.
2. Yeni hesap oluştur ve karşılama ekranını tamamla.
3. Bir tarifi favorile; profil ekranında `Gerçek Hesap` rozetini kontrol et.
4. Tarif detayından eksik malzemeleri sepete ekle.
5. Uygulamayı yenile veya yeniden aç; favori ve sepet ürünlerinin geri geldiğini doğrula.
6. Tarif paylaş ekranından başlık, malzeme ve hazırlık adımı içeren bir tarif ekle.
7. Çıkış yap; uygulamanın Demo Modu'na döndüğünü doğrula.
8. Tekrar giriş yap; gerçek hesaba ait favori, sepet ve tarif verilerinin geri geldiğini kontrol et.
