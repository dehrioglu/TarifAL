# TarifAL Kapalı Beta Demo Paketi

Bu dosya TarifAL MVP'sini 10-20 beta kullanıcıya, yatırımcıya veya iş ortağına tek paket halinde göstermek için hazırlanmıştır.

## TarifAL Nedir?

TarifAL, kullanıcının evindeki malzemeleri akıllı tarif önerilerine, eksik ürünleri ise market sepetine dönüştüren yapay zeka destekli mutfak asistanıdır.

Ana değer önerisi:

```text
Ana Sayfa -> Tarif Aç -> Eksikleri Sepete Ekle -> Sepet -> Akıllı Sipariş Demosu -> Pişirme Modu -> Feedback Ver
```

TarifAL gerçek sipariş veya ödeme oluşturmaz. Bu MVP'de sipariş, market ve ödeme akışları demo olarak simüle edilir.

## Web Demo Linki

```text
https://tarif-ai.vercel.app
```

Vercel yayını yapıldıktan sonra bu alan canlı linkle güncellenmelidir.

## Android APK / Preview Build Linki

```text
APK linki: Kurucu tarafından eklenecek
EAS build linki: Kurucu tarafından eklenecek
```

## Demo Kullanıcı Bilgisi

```text
Demo email: demo@tarifal.app
Demo şifre: Şifreyi kurucudan isteyin
```

Güvenlik notu: Gerçek demo şifresi repoya yazılmamalıdır.

## Beta Davet Kodları

Beta davet kodları herkese açık dokümanda paylaşılmaz. Kurucu veya TarifAL ekibi kodu beta kullanıcısına özel olarak iletir.

Geçerli davet kodu girildiğinde profil ekranında `Beta Test Kullanıcısı` rozeti görünür.

## 1 Dakikalık Demo Akışı

1. Ana sayfada TarifAL logosu, akıllı mutfak dashboard'u ve ana CTA gösterilir.
2. Bir tarif açılır.
3. Tarif detayında dolap uyumu, eksik ürünler ve pişirme bilgileri gösterilir.
4. `Eksikleri Sepete Ekle` aksiyonu ile eksikler TarifAL Sepet'e aktarılır.
5. Sepet ekranında ürünler, toplam tutar ve demo market bilgisi gösterilir.
6. Akıllı sipariş demosu tamamlanır.
7. Pişirme moduna geçilir.
8. Kullanıcı feedback verir ve mini anketi cevaplar.

Kısa anlatım cümlesi:

```text
TarifAL kullanıcıya sadece tarif göstermez; tarifi alışverişe ve pişirme sürecine bağlar.
```

## Beta Test Görevleri

Beta kullanıcıdan istenecek görevler:

1. Kayıt ol veya demo hesapla giriş yap.
2. Profil ekranından kurucudan aldığın beta davet kodunu gir.
3. Ana sayfadan bir tarif aç.
4. Tarifi favoriye ekle.
5. Eksik ürünleri sepete ekle.
6. Sepeti kontrol et.
7. Akıllı sipariş demosunu tamamla.
8. Pişirme moduna geç.
9. Tarif paylaş.
10. Geri bildirim ver.
11. Mini anketi cevapla.
12. Uygulamayı kapatıp aç; favori ve sepetin korunuyor mu kontrol et.

## Feedback Nasıl Verilir?

Uygulama içinde şu ekranlarda `Geri bildirim` butonu bulunur:

- Ana Sayfa
- Tarif Detay
- Sepet
- Profil
- AI Şef
- Akıllı Sipariş / Checkout
- Tarif Paylaş

Feedback türleri:

- Beğendim
- Anlamadım
- Hata gördüm
- Eksik özellik var
- Fikir önerim var

## Kurucu Panelinde İzlenecek Metrikler

Kurucu hesabı:

```text
kervankayaenes@gmail.com
```

Panelde izlenecek karar metrikleri:

- Toplam kullanıcı
- Beta kullanıcı sayısı
- Toplam feedback
- Ortalama memnuniyet skoru
- Toplam tarif açılma
- Toplam favori ekleme
- Oluşturulan sepet sayısı
- Tamamlanan sipariş demosu sayısı
- Sepete dönüşüm oranı
- Sipariş demosu tamamlama oranı
- En çok açılan tarifler
- En çok favorilenen tarifler
- En çok feedback gelen ekran
- En çok beğenilen ekran
- En çok anlaşılmayan ekran
- En çok hata bildirilen alan
- Market siparişi niyet anketi sonucu

## Bilinen Sınırlamalar

- Gerçek ödeme alınmaz.
- Gerçek market siparişi oluşturulmaz.
- Gerçek kurye takibi yoktur.
- AI cevapları MVP demosunda simüle edilir.
- Market fiyatları ve restoran seçenekleri mock/demo veridir.
- Firebase config girilmezse uygulama Demo Modu ile çalışır.

## Test Sonrası Geri Bildirim Beklentisi

Beta kullanıcıdan özellikle şu sorulara cevap beklenir:

- İlk 10 saniyede TarifAL'in ne işe yaradığını anladın mı?
- Eksik malzemeleri sepete ekleme fikri mantıklı mı?
- Bu akışı gerçek market siparişinde kullanır mıydın?
- Hangi ekran en çok hoşuna gitti?
- Hangi ekran kafanı karıştırdı?
- Uygulamada hata veya bozuk buton gördün mü?
