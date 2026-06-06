# TarifAL Partner Paneli

TarifAL Partner Paneli, TarifAL kullanıcı uygulamasından bağımsız çalışan B2B yönetim panelidir. Restoranlar, marketler, markalar ve TarifAL operasyon ekibi için sipariş, menü, market ürünü, sponsorlu ürün, kampanya ve performans yönetimi sağlar.

Bu panel normal kullanıcı uygulaması değildir. TarifAL'in ticari tarafını gösteren ayrı bir web uygulamasıdır.

## Hedef Kullanıcılar

- Restoran sahipleri
- Market yöneticileri
- Marka / ürün tedarikçileri
- TarifAL operasyon ve admin ekibi
- Sipariş hazırlama personeli

## Roller

- `admin`: Tüm işletmeleri, siparişleri, ürünleri, kampanyaları ve raporları görür.
- `restaurant_owner`: Kendi restoranını, menüsünü ve restoran siparişlerini yönetir.
- `market_owner`: Kendi marketini, ürünlerini, stoklarını ve market siparişlerini yönetir.
- `brand_manager`: Kendi sponsorlu ürünlerini, kampanyalarını ve reklam performansını yönetir.
- `staff`: Bağlı olduğu işletmenin siparişlerini görür ve durum günceller.

## Kurulum

```bash
cd apps/partner-panel
npm install
npm run dev
```

Yerel geliştirme adresi varsayılan olarak:

```text
http://localhost:5174
```

## Build

```bash
npm run typecheck
npm run build
```

## Demo Hesaplar

Şifreler repo içinde tutulmaz. Demo şifrelerini kurucudan isteyin.

| Rol | E-posta |
| --- | --- |
| Admin | admin@tarifal.app |
| Restoran | restaurant@tarifal.app |
| Market | market@tarifal.app |
| Marka | brand@tarifal.app |
| Personel | staff@tarifal.app |

Panel şu anda demo rol seçimiyle çalışır. Gerçek Auth bağlandığında `authService.ts` Firebase Auth ile güncellenebilir.

## Firebase Ayarları

Panel Firebase hazır olacak şekilde servis katmanıyla kuruldu. Gerçek bağlantı için `.env` dosyasında şu değişkenler kullanılabilir:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firestore Koleksiyonları

Önerilen koleksiyonlar:

- `partnerUsers`
- `businesses`
- `restaurants`
- `markets`
- `brands`
- `restaurantItems`
- `marketProducts`
- `orders`
- `campaigns`
- `sponsoredProducts`
- `partnerNotifications`
- `partnerReports`

## Veri Modeli Mantığı

Kullanıcı uygulamasında oluşan siparişler `orders` koleksiyonuna düşebilir. Partner Paneli aynı koleksiyondaki siparişleri role ve `businessId` alanına göre filtreleyerek gösterir.

Bağlantı mantığı:

- Restoran paneli sadece kendi restoran siparişlerini görür.
- Market paneli sadece kendi market siparişlerini görür.
- Marka paneli kendi sponsorlu ürün ve kampanya performansını görür.
- Admin tüm platform verisini görür.
- Staff sadece bağlı olduğu işletmenin sipariş durumlarını günceller.

## Sipariş Yönetimi

Sipariş ekranında şu durumlar desteklenir:

- Yeni
- Kabul edildi
- Hazırlanıyor
- Teslimata hazır
- Yolda
- Tamamlandı
- İptal

Desktop görünümde tablo, mobil görünümde kart yapısı kullanılır.

## Restoran Yönetimi

Restoran sahipleri:

- Restoran profilini görebilir.
- Restoranı aktif/pasif yapabilir.
- Menü ürünlerini listeleyebilir.
- Yeni yemek ekleyebilir.
- Yemek stok/aktiflik durumunu değiştirebilir.

## Market Yönetimi

Market sahipleri:

- Market profilini görebilir.
- Marketi aktif/pasif yapabilir.
- Ürünleri listeleyebilir.
- Yeni ürün ekleyebilir.
- Stok artırabilir.
- Ürünü stok dışına alabilir.

## Marka ve Sponsorlu Ürün Yönetimi

Marka yöneticileri:

- Sponsorlu ürünleri görebilir.
- Yeni sponsorlu ürün ekleyebilir.
- Aktif/pasif durumunu değiştirebilir.
- Gösterim, tıklama ve sepete ekleme metriklerini takip edebilir.

## Kampanya Yönetimi

Kampanya türleri:

- Ürün indirimi
- Menü indirimi
- Sponsorlu ürün kampanyası
- Sepette indirim
- Tarif kategorisine özel kampanya
- İlk sipariş indirimi

## Raporlar

Rapor ekranı role göre demo metrik üretir:

- Sipariş sayısı
- Ortalama sepet
- Tahmini ciro
- Sponsorlu ürün gösterimi
- Tıklama ve sepete ekleme oranı
- Düşük stok sayısı
- Kampanya performansı

## Güvenlik ve Yetki Notu

Gerçek production Firestore rules şu mantıkla sıkılaştırılmalıdır:

- `admin` tüm kayıtları okuyabilir/yazabilir.
- `restaurant_owner`, `market_owner`, `staff` sadece kendi `businessId` alanına sahip kayıtları görebilir.
- `brand_manager` sadece kendi `brandId` alanına sahip sponsorlu ürün ve kampanyaları görebilir.
- Sipariş durumu güncelleme sadece yetkili rollerle sınırlanmalıdır.

## Deploy

Vercel için ayrı proje olarak deploy etmek önerilir.

Build ayarları:

```text
Framework: Vite
Root Directory: apps/partner-panel
Build Command: npm run build
Output Directory: dist
```

## Bilinen Sınırlamalar

- Gerçek Firebase Auth henüz aktif değildir.
- Veriler mock/demo servislerinden gelir.
- Formlar demo state'e yazar; sayfa yenilenirse demo eklemeler sıfırlanabilir.
- Gerçek ödeme, gerçek sipariş ve gerçek ürün senkronizasyonu yapılmaz.

## Sonraki Geliştirme Fikirleri

- Firebase Auth ile gerçek partner girişi
- Firestore CRUD servisleri
- Sipariş durum değişikliklerinde kullanıcı uygulamasına canlı bildirim
- Market stoklarını CSV ile içe aktarma
- Sponsorlu ürün bütçe tüketimi
- Admin onay akışı
- Partner bazlı fatura ve komisyon raporu

## Manuel Test Listesi

- Admin giriş yapınca tüm menüler görünüyor mu?
- Restoran giriş yapınca restoran menüleri ve kendi siparişleri görünüyor mu?
- Market giriş yapınca market ürünleri ve kendi siparişleri görünüyor mu?
- Marka giriş yapınca sponsorlu ürün/kampanya ekranları görünüyor mu?
- Staff giriş yapınca sınırlı sipariş ekranı çalışıyor mu?
- Sipariş listesi yükleniyor mu?
- Sipariş detayı açılıyor mu?
- Sipariş durumu güncelleniyor mu?
- Restoran yemek ekleyebiliyor mu?
- Market ürün ekleyebiliyor mu?
- Marka sponsorlu ürün ekleyebiliyor mu?
- Kampanya oluşturulabiliyor mu?
- Bildirimler okundu yapılabiliyor mu?
- Dashboard metrikleri role göre değişiyor mu?
- Mobil görünümde tablo yerine kart görünümü geliyor mu?
- `npm run typecheck` başarılı mı?
- `npm run build` başarılı mı?
