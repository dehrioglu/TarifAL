import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { AppButton } from './AppButton';

type BetaTestGuideModalProps = {
  visible: boolean;
  onClose: () => void;
};

const betaSteps = [
  {
    title: 'Beta koduyla beta kullanıcısı ol',
    text: 'Profil ekranında Beta’ya Katıl alanını aç ve TarifAL ekibinden aldığın davet kodunu girerek beta rozetini aktif et.',
  },
  {
    title: 'Bir tarif aç',
    text: 'Ana sayfa veya Keşfet üzerinden bir tarif detayına gir. Tarif ekranı anlaşılırlığı için çıkan mini anketi cevapla.',
  },
  {
    title: 'Tarif ekranı anketini cevapla',
    text: '“Bu tarif ekranı anlaşılır mıydı?” sorusunda Evet, Kısmen veya Hayır seçeneklerinden birini işaretle.',
  },
  {
    title: 'Tarifi favoriye ekle',
    text: 'Kalp ikonuyla favoriye ekle ve geri bildirimin görsel olarak geldiğini kontrol et.',
  },
  {
    title: 'Eksikleri sepete ekle',
    text: 'Tarif detayında eksik ürünleri TarifAL Sepet’e aktar ve “mantıklı mıydı?” mini anketini cevapla.',
  },
  {
    title: 'Sepeti kontrol et',
    text: 'Sepet ekranında ürünlerin, kaynak tariflerin ve toplam fiyat alanının anlaşılır göründüğünü kontrol et.',
  },
  {
    title: 'Demo siparişi tamamla',
    text: 'Akıllı Sipariş akışında demo siparişi onayla ve gerçek ödeme/sipariş oluşturulmadığı bilgisinin net olduğunu doğrula.',
  },
  {
    title: 'Market siparişi sorusunu cevapla',
    text: '“Bu akışı gerçek market siparişinde kullanır mıydın?” mini anketini cevapla.',
  },
  {
    title: 'Bir tarif paylaş',
    text: 'Paylaş sekmesinden demo tarif oluştur ve tarif paylaşma süreci kolay mı sorusunu cevapla.',
  },
  {
    title: 'Geri bildirim notu bırak',
    text: 'Herhangi bir ekrandaki Geri bildirim butonunu kullanarak kısa bir not ve 1-5 memnuniyet skoru gönder.',
  },
];

export function BetaTestGuideModal({ visible, onClose }: BetaTestGuideModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="clipboard-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Beta test rehberi</Text>
              <Text style={styles.title}>MVP akışını kontrollü test et</Text>
              <Text style={styles.description}>
                Bu rehber gerçek kullanıcı beta testi için hazırlanmıştır. Her adım hem deneyimi hem de ölçümlemeyi doğrular.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Beta rehberini kapat"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepList}>
            {betaSteps.map((step, index) => (
              <View key={step.title} style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Not: Demo sipariş ve ödeme adımları gerçek işlem oluşturmaz; yatırımcı demosu için simüle edilir.
            </Text>
            <AppButton title="Rehberi Kapat" icon="checkmark-circle-outline" onPress={onClose} style={styles.closeCta} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 16, 32, 0.42)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  sheet: {
    maxHeight: '88%',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
    ...theme.shadow,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepList: {
    gap: 10,
    paddingBottom: 4,
  },
  stepCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  stepText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  footer: {
    gap: 10,
  },
  footerText: {
    color: theme.colors.subtle,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '800',
  },
  closeCta: {
    minHeight: 48,
  },
});
