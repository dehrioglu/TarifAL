# TarifAL Kapalı Beta Manuel Test Checklist

Bu liste kapalı beta yayını öncesi web, Expo Go ve Android preview APK için kullanılmalıdır.

## Auth

- [ ] Kayıt başarılı mı?
- [ ] Giriş başarılı mı?
- [ ] Çıkış başarılı mı?
- [ ] Uygulama yenilenince oturum korunuyor mu?
- [ ] Yanlış email/şifre mesajı kullanıcı dostu mu?
- [ ] Firebase config yokken Demo Modu açılıyor mu?

## Demo Mode / Gerçek Hesap Ayrımı

- [ ] Giriş yapılmadığında demo profil görünüyor mu?
- [ ] Demo favoriler çalışıyor mu?
- [ ] Demo sepet çalışıyor mu?
- [ ] Demo feedback akışı hata vermiyor mu?
- [ ] Gerçek hesapta favoriler Firestore'a yazılıyor mu?
- [ ] Gerçek hesapta sepet Firestore'a yazılıyor mu?
- [ ] Demo veri ile gerçek kullanıcı verisi karışmıyor mu?

## Beta

- [ ] Kurucudan verilen beta davet kodu çalışıyor mu?
- [ ] Beta kodları uygulama içinde görünür şekilde listelenmiyor mu?
- [ ] Beta kodları README veya demo paketinde açık paylaşılmıyor mu?
- [ ] Yanlış beta kodu sade hata veriyor mu?
- [ ] Geçerli kod sonrası `Beta Test Kullanıcısı` rozeti görünüyor mu?
- [ ] Gerçek hesapta `users/{userId}.isBetaTester` true oluyor mu?
- [ ] `betaCode` yazılıyor mu?
- [ ] `betaJoinedAt` yazılıyor mu?
- [ ] `beta_joined` event'i yazılıyor mu?

## Tarif

- [ ] Ana sayfadan tarif açılıyor mu?
- [ ] Tarif detay görseli veya placeholder düzgün görünüyor mu?
- [ ] `recipe_opened` event'i yazılıyor mu?
- [ ] Favoriye ekleme çalışıyor mu?
- [ ] Favoriden çıkarma çalışıyor mu?
- [ ] Favori uygulama yenilenince korunuyor mu?
- [ ] Tarif detay feedback butonu çalışıyor mu?
- [ ] Tarif detay mini anketi aynı kullanıcıya tekrar tekrar çıkmıyor mu?

## Sepet

- [ ] Eksik ürünler sepete ekleniyor mu?
- [ ] Sepet sayacı güncelleniyor mu?
- [ ] Sepet uygulama yenilenince korunuyor mu?
- [ ] Ürün artırma/azaltma çalışıyor mu?
- [ ] Ürün silme çalışıyor mu?
- [ ] Sepeti boşaltma çalışıyor mu?
- [ ] Boş sepet durumu temiz görünüyor mu?
- [ ] `missing_items_added_to_cart` veya `cart_item_added` event'i yazılıyor mu?

## Akıllı Sipariş Demosu

- [ ] Sepetten checkout ekranına geçiliyor mu?
- [ ] `checkout_demo_started` event'i yazılıyor mu?
- [ ] Demo market bilgisi görünüyor mu?
- [ ] Teslimat ve toplam tutar görünüyor mu?
- [ ] Demo sipariş onaylanıyor mu?
- [ ] Gerçek ödeme veya gerçek sipariş oluşturulmadığı açık mı?
- [ ] `checkout_demo_completed` event'i yazılıyor mu?
- [ ] Sipariş sonrası mini anket çıkıyor mu?

## Pişirme Modu

- [ ] Tariften pişirme moduna geçiliyor mu?
- [ ] Önceki/Sonraki adım çalışıyor mu?
- [ ] Son adımda tamamla butonu görünüyor mu?
- [ ] Tamamlayınca başarı mesajı görünüyor mu?

## Tarif Paylaşma

- [ ] Tarif paylaş formu açılıyor mu?
- [ ] Zorunlu alanlar boşsa uyarı veriyor mu?
- [ ] Tarif paylaşılınca listeye ekleniyor mu?
- [ ] Gerçek hesapta `recipes` koleksiyonuna yazılıyor mu?
- [ ] `recipe_shared` event'i yazılıyor mu?
- [ ] Tarif paylaş mini anketi çalışıyor mu?

## Feedback

- [ ] Ana sayfa feedback butonu çalışıyor mu?
- [ ] Tarif detay feedback butonu çalışıyor mu?
- [ ] Sepet feedback butonu çalışıyor mu?
- [ ] Profil feedback butonu çalışıyor mu?
- [ ] AI Şef feedback butonu çalışıyor mu?
- [ ] Checkout feedback butonu çalışıyor mu?
- [ ] Tarif paylaş feedback butonu çalışıyor mu?
- [ ] `feedback` koleksiyonuna kayıt yazılıyor mu?
- [ ] `feedback_submitted` event'i yazılıyor mu?
- [ ] Mini anket cevabı `miniSurveyResponses` koleksiyonuna yazılıyor mu?
- [ ] `mini_survey_answered` event'i yazılıyor mu?

## Founder Panel

- [ ] Kurucu email ile panel görünüyor mu?
- [ ] Normal kullanıcıda panel gizli mi?
- [ ] Toplam kullanıcı metriği yükleniyor mu?
- [ ] Beta kullanıcı sayısı yükleniyor mu?
- [ ] Toplam feedback yükleniyor mu?
- [ ] Ortalama memnuniyet skoru yükleniyor mu?
- [ ] Tarif açılma, favori, sepet ve checkout metrikleri yükleniyor mu?
- [ ] En çok açılan/favorilenen tarifler görünüyor mu?
- [ ] En çok feedback gelen ekran görünüyor mu?
- [ ] En çok hata/anlamadım bildirilen ekran görünüyor mu?
- [ ] Market siparişi niyeti anket sonucu görünüyor mu?
- [ ] Veri yokken `Henüz yeterli beta verisi yok.` mesajı görünüyor mu?

## Sipariş Takip Admin Paneli

- [ ] Akıllı Sipariş demosu tamamlanınca `orders` koleksiyonuna kayıt yazılıyor mu?
- [ ] Sipariş numarası `ORD-` formatında oluşuyor mu?
- [ ] Başarı modalında sipariş numarası görünüyor mu?
- [ ] Kurucu email ile `Siparişler` paneli görünüyor mu?
- [ ] Normal kullanıcı admin sipariş panelini göremiyor mu?
- [ ] Siparişler kanban kolonlarında listeleniyor mu?
- [ ] Sipariş detay modalı açılıyor mu?
- [ ] Ürün listesi, market, toplam ve ödeme durumu görünüyor mu?
- [ ] Sipariş durumu güncelleniyor mu?
- [ ] `completed` status seçilince `completedAt` yazılıyor mu?
- [ ] `order_created` event'i yazılıyor mu?
- [ ] `order_status_updated` event'i yazılıyor mu?
- [ ] `order_completed` ve `order_cancelled` eventleri ilgili durumlarda yazılıyor mu?

## UI Son Cilalama

- [ ] Mobilde taşan kart yok mu?
- [ ] Webde içerik çok genişlemiyor mu?
- [ ] Alt menü içerikle çakışmıyor mu?
- [ ] Floating AI Şef butonu kritik butonları kapatmıyor mu?
- [ ] Hızlı + menüsü kapatılabiliyor mu?
- [ ] Feedback modalı mobilde ekrana sığıyor mu?
- [ ] Founder panel mobilde okunuyor mu?
- [ ] Kayıt/giriş hata mesajları anlaşılır mı?
- [ ] Loading sırasında boş beyaz ekran kalmıyor mu?

## Production Firebase Rules

- [ ] `firestore.rules` Firebase Console veya CLI tarafında syntax hatası vermeden yayınlanıyor mu?
- [ ] Girişsiz kullanıcı `users/{uid}`, `cart`, `favorites`, `orders` özel verilerine erişemiyor mu?
- [ ] Gerçek kullanıcı sadece kendi `users/{userId}` dokümanını okuyup güncelleyebiliyor mu?
- [ ] Gerçek kullanıcı sadece kendi `favorites` alt koleksiyonuna yazabiliyor mu?
- [ ] Gerçek kullanıcı sadece kendi `cart` alt koleksiyonuna yazabiliyor mu?
- [ ] Gerçek kullanıcı kendi `orders` kaydını oluşturup okuyabiliyor mu?
- [ ] Normal kullanıcı `orders.status` güncelleyemiyor mu?
- [ ] Kurucu/admin `orders.status` güncelleyebiliyor mu?
- [ ] `feedback`, `miniSurveyResponses` ve `analyticsEvents` yalnızca gerçek giriş yapmış kullanıcıdan yazılıyor mu?
- [ ] Demo Mode feedback/analytics Firestore'a yazılmadan lokal başarıyla kapanıyor mu?
- [ ] `sponsoredProducts` herkes tarafından okunup sadece admin/founder tarafından yazılabiliyor mu?
- [ ] Firebase Storage kapalıyken uygulama açılıyor mu?
- [ ] `.env` içinde Storage bucket boşken Firebase Auth + Firestore çalışıyor mu?
- [ ] Tarif paylaşırken görsel upload zorunlu değil mi?
- [ ] Görsel URL girilirse tarifte bu URL kullanılıyor mu?
- [ ] Görsel URL yoksa premium placeholder/varsayılan görsel çalışıyor mu?
- [ ] Sponsorlu ürünlerde görsel yoksa marka/ürün placeholder görünüyor mu?

## Production Veri Modeli

- [ ] `users/{userId}.role` alanı yeni hesapta `user`, kurucu emailde `founder` olarak oluşuyor mu?
- [ ] Favori dokümanında `recipeId`, `title`, `imageURL`, `savedAt` alanları var mı?
- [ ] Sepet dokümanında `itemId`, `name`, `quantity`, `price`, `sourceRecipeId`, `createdAt`, `updatedAt` alanları var mı?
- [ ] Sipariş dokümanında `paymentStatus: demo` ve `isPaid: false` net görünüyor mu?
- [ ] Demo kullanıcı verileri gerçek `users/{uid}` altına yazılmıyor mu?

## Build

- [ ] `npm run typecheck` başarılı mı?
- [ ] `npm run export:web` başarılı mı?
- [ ] Vercel deploy sonrası web link çalışıyor mu?
- [ ] Expo Go ile uygulama açılıyor mu?
- [ ] Android preview APK build alınabiliyor mu?
