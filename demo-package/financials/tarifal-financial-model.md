# TarifAL 12 Aylık Finansal Projeksiyon

Bu dosya yatırımcı demosu için hazırlanmış tahmini bir finansal modeldir. Veriler gerçek ciro taahhüdü değildir; MVP iş modelini anlatmak için simülasyon olarak kullanılmalıdır.

## Ana Varsayımlar

- 1. ay aktif kullanıcı: 500
- Gerçekçi senaryoda aylık kullanıcı artışı: %25
- Gerçekçi senaryoda sipariş dönüşüm oranı: %8
- Ortalama sepet tutarı: 450 TL
- TarifAL komisyon oranı: %8
- Premium abonelik fiyatı: 79 TL / ay
- Premium dönüşüm oranı: %2
- Sponsorlu içerik geliri 4. aydan itibaren başlar
- Aylık sabit yazılım/server gideri: 2.500 TL
- Pazarlama gideri 1-3. ay: 5.000 TL
- Pazarlama gideri 4-8. ay: 10.000 TL
- Pazarlama gideri 9-12. ay: 15.000 TL
- Operasyon gideri kullanıcı büyüdükçe kademeli artar

## Hesaplama Mantığı

- Tahmini Sipariş Sayısı = Aktif Kullanıcı x Sipariş Dönüşüm Oranı
- Toplam Sepet Hacmi = Sipariş Sayısı x Ortalama Sepet Tutarı
- Komisyon Geliri = Toplam Sepet Hacmi x Komisyon Oranı
- Premium Kullanıcı Sayısı = Aktif Kullanıcı x Premium Dönüşüm Oranı
- Premium Geliri = Premium Kullanıcı Sayısı x Premium Abonelik Fiyatı
- Toplam Gelir = Komisyon Geliri + Premium Geliri + Sponsorlu İçerik Geliri
- Toplam Gider = Server/Yazılım + Pazarlama + Operasyon
- Net Kar/Zarar = Toplam Gelir - Toplam Gider
- Kümülatif Kar/Zarar = Önceki ayların toplam net sonucu

## Gerçekçi Senaryo - 12 Aylık Tablo

| Ay | Aktif Kullanıcı | Sipariş | Sepet Hacmi | Komisyon Geliri | Premium Geliri | Sponsorlu Gelir | Toplam Gelir | Toplam Gider | Net Kar/Zarar | Kümülatif |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 500 | 40 | 18.000 TL | 1.440 TL | 790 TL | 0 TL | 2.230 TL | 10.500 TL | -8.270 TL | -8.270 TL |
| 2 | 625 | 50 | 22.500 TL | 1.800 TL | 1.027 TL | 0 TL | 2.827 TL | 10.500 TL | -7.673 TL | -15.943 TL |
| 3 | 781 | 62 | 27.900 TL | 2.232 TL | 1.264 TL | 0 TL | 3.496 TL | 10.500 TL | -7.004 TL | -22.947 TL |
| 4 | 977 | 78 | 35.100 TL | 2.808 TL | 1.580 TL | 3.000 TL | 7.388 TL | 17.500 TL | -10.112 TL | -33.059 TL |
| 5 | 1.221 | 98 | 44.100 TL | 3.528 TL | 1.896 TL | 4.000 TL | 9.424 TL | 17.500 TL | -8.076 TL | -41.135 TL |
| 6 | 1.526 | 122 | 54.900 TL | 4.392 TL | 2.449 TL | 5.000 TL | 11.841 TL | 17.500 TL | -5.659 TL | -46.794 TL |
| 7 | 1.907 | 153 | 68.850 TL | 5.508 TL | 3.002 TL | 7.500 TL | 16.010 TL | 20.000 TL | -3.990 TL | -50.784 TL |
| 8 | 2.384 | 191 | 85.950 TL | 6.876 TL | 3.792 TL | 10.000 TL | 20.668 TL | 20.000 TL | 668 TL | -50.116 TL |
| 9 | 2.980 | 238 | 107.100 TL | 8.568 TL | 4.740 TL | 12.500 TL | 25.808 TL | 25.000 TL | 808 TL | -49.308 TL |
| 10 | 3.725 | 298 | 134.100 TL | 10.728 TL | 5.925 TL | 15.000 TL | 31.653 TL | 27.500 TL | 4.153 TL | -45.155 TL |
| 11 | 4.657 | 373 | 167.850 TL | 13.428 TL | 7.347 TL | 17.500 TL | 38.275 TL | 27.500 TL | 10.775 TL | -34.380 TL |
| 12 | 5.821 | 466 | 209.700 TL | 16.776 TL | 9.164 TL | 20.000 TL | 45.940 TL | 27.500 TL | 18.440 TL | -15.940 TL |

## Senaryo Özeti

| Senaryo | Kullanıcı Artışı | Sipariş Dönüşümü | Premium Dönüşümü | 12. Ay Gelir | 12. Ay Net | 12. Ay Kümülatif |
|---|---:|---:|---:|---:|---:|---:|
| Kötümser | %12 | %4 | %1 | 12.303 TL | -15.197 TL | -163.473 TL |
| Gerçekçi | %25 | %8 | %2 | 45.940 TL | 18.440 TL | -15.940 TL |
| İyimser | %38 | %12 | %4 | 180.867 TL | 153.367 TL | 457.018 TL |

## Senaryo Yorumları

### Kötümser Senaryo

- Başa baş noktasına ilk 12 ay içinde yaklaşmaz.
- En büyük gelir kalemi düşük hacimli market komisyonudur.
- En büyük gider kalemi pazarlama ve operasyon gideridir.
- Yatırım alınırsa öncelik kullanıcı edinim maliyetini düşürmeye ve market dönüşümünü artırmaya verilmelidir.

### Gerçekçi Senaryo

- Aylık bazda 8. ayda başa baş noktasına yaklaşır, 10. aydan itibaren daha anlamlı pozitif net sonuç üretir.
- En büyük gelir kalemi market komisyonu ve sponsorlu içerik kombinasyonudur.
- En büyük gider kalemi büyüme dönemindeki pazarlama gideridir.
- Yatırım alınırsa ürün analitiği, kullanıcı kazanımı, ilk market entegrasyonu ve premium plan testleri öncelik olmalıdır.

### İyimser Senaryo

- 5. ayda aylık bazda pozitife geçer, 6. ay itibarıyla kümülatif olarak da pozitife yaklaşır.
- En büyük gelir kalemi market komisyonudur; premium gelir ikinci güçlü kanal olur.
- En büyük gider kalemi pazarlama gideridir, ancak gelir artışı gideri hızlı şekilde aşar.
- Yatırım alınırsa market entegrasyonları, performans pazarlaması ve marka iş birlikleri ölçeklenmelidir.

## Not

Bu projeksiyon, TarifAL'in potansiyel iş modelini anlatmak için hazırlanmıştır. Gerçek sonuçlar kullanıcı edinim maliyeti, market anlaşmaları, komisyon oranları, premium dönüşüm, operasyon yükü ve pazarlama verimliliğine göre değişir.

