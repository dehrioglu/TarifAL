import type { PartnerRole, PartnerUser } from '../types';
import { authService } from '../services/authService';
import { roleLabels } from '../utils/format';
import { AppButton } from '../components/AppButton';

interface LoginScreenProps {
  onLogin: (user: PartnerUser) => void;
}

const roleDescriptions: Record<PartnerRole, string> = {
  admin: 'Tüm platform, işletmeler, siparişler ve gelir metrikleri.',
  restaurant_owner: 'Restoran profilini, menünü ve sipariş operasyonunu yönet.',
  market_owner: 'Market ürünlerini, stoklarını, fiyatlarını ve siparişlerini yönet.',
  brand_manager: 'Sponsorlu ürünleri, kampanyaları ve reklam performansını izle.',
  staff: 'Sınırlı operasyon yetkisiyle sipariş durumlarını güncelle.',
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const demoUsers = authService.getDemoUsers();

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="brand-lockup brand-lockup--login">
          <div className="brand-lockup__mark">T</div>
          <div>
            <strong>TarifAL Partner Paneli</strong>
            <span>Restoran, market ve marka operasyon merkezi</span>
          </div>
        </div>
        <h1>TarifAL’in B2B tarafını tek panelden yönetin.</h1>
        <p>
          Siparişler, menüler, market ürünleri, sponsorlu vitrinler ve kampanya performansı için ayrı,
          profesyonel ve yatırımcı demosuna hazır panel.
        </p>
        <div className="login-hero__badges">
          <span>Role göre yetki</span>
          <span>Demo veri hazır</span>
          <span>Firestore’a uygun servis katmanı</span>
        </div>
      </section>

      <section className="login-card">
        <span className="page-header__eyebrow">Demo giriş</span>
        <h2>Rol seçerek panele gir</h2>
        <p>Gerçek şifreler repo içine yazılmaz. Demo hesap şifrelerini kurucudan isteyin.</p>
        <div className="role-grid">
          {demoUsers.map((user) => (
            <button key={user.id} type="button" className="role-card" onClick={() => onLogin(user)}>
              <span>{roleLabels[user.role]}</span>
              <strong>{user.email}</strong>
              <p>{roleDescriptions[user.role]}</p>
            </button>
          ))}
        </div>
        <AppButton type="button" variant="secondary" onClick={() => onLogin(authService.loginWithRole('admin'))}>
          Admin demo hesabıyla devam et
        </AppButton>
      </section>
    </main>
  );
}
