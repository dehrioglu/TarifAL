import { useMemo, useState } from 'react';
import type { PartnerUser, ToastMessage } from './types';
import { authService } from './services/authService';
import { notificationService } from './services/notificationService';
import { PartnerLayout } from './layouts/PartnerLayout';
import { ToastStack } from './components/Toast';
import { LoginScreen } from './screens/LoginScreen';
import { PartnerDashboard } from './screens/PartnerDashboard';
import { OrdersScreen } from './screens/OrdersScreen';
import { RestaurantManagementScreen } from './screens/RestaurantManagementScreen';
import { RestaurantMenuScreen } from './screens/RestaurantMenuScreen';
import { MarketManagementScreen } from './screens/MarketManagementScreen';
import { MarketProductsScreen } from './screens/MarketProductsScreen';
import { SponsoredProductsScreen } from './screens/SponsoredProductsScreen';
import { CampaignsScreen } from './screens/CampaignsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdminBusinessesScreen } from './screens/AdminBusinessesScreen';

export function App() {
  const [currentUser, setCurrentUser] = useState<PartnerUser | null>(() => authService.restoreSession());
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notificationVersion, setNotificationVersion] = useState(0);

  const unreadCount = useMemo(() => {
    if (!currentUser) {
      return 0;
    }

    return notificationService.getNotificationsForUser(currentUser).filter((notification) => !notification.isRead).length;
  }, [currentUser, notificationVersion]);

  const showToast = (title: string, message: string, tone: ToastMessage['tone'] = 'info') => {
    const toast: ToastMessage = {
      id: Date.now() + Math.random(),
      title,
      message,
      tone,
    };
    setToasts((items) => [...items, toast]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== toast.id));
    }, 4200);
  };

  const handleLogin = (user: PartnerUser) => {
    const persistedUser = authService.loginWithRole(user.role);
    setCurrentUser(persistedUser);
    setActiveScreen('dashboard');
    showToast('Giriş başarılı', `${persistedUser.displayName} rolüyle panele giriş yapıldı.`, 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveScreen('dashboard');
  };

  if (!currentUser) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <ToastStack messages={toasts} onDismiss={(id) => setToasts((items) => items.filter((item) => item.id !== id))} />
      </>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'orders':
        return <OrdersScreen user={currentUser} onToast={showToast} />;
      case 'businesses':
        return <AdminBusinessesScreen user={currentUser} onToast={showToast} />;
      case 'restaurant':
        return <RestaurantManagementScreen user={currentUser} onToast={showToast} />;
      case 'restaurant-menu':
        return <RestaurantMenuScreen user={currentUser} onToast={showToast} />;
      case 'market':
        return <MarketManagementScreen user={currentUser} onToast={showToast} />;
      case 'market-products':
        return <MarketProductsScreen user={currentUser} onToast={showToast} />;
      case 'sponsored-products':
        return <SponsoredProductsScreen user={currentUser} onToast={showToast} />;
      case 'campaigns':
        return <CampaignsScreen user={currentUser} onToast={showToast} />;
      case 'reports':
        return <ReportsScreen user={currentUser} />;
      case 'notifications':
        return (
          <NotificationsScreen
            user={currentUser}
            onToast={(title, message, tone) => {
              showToast(title, message, tone);
              setNotificationVersion((value) => value + 1);
            }}
          />
        );
      case 'settings':
        return <SettingsScreen user={currentUser} onToast={showToast} />;
      default:
        return <PartnerDashboard user={currentUser} onNavigate={setActiveScreen} />;
    }
  };

  return (
    <>
      <PartnerLayout
        user={currentUser}
        activeScreen={activeScreen}
        unreadCount={unreadCount}
        onNavigate={setActiveScreen}
        onLogout={handleLogout}
      >
        {renderScreen()}
      </PartnerLayout>
      <ToastStack messages={toasts} onDismiss={(id) => setToasts((items) => items.filter((item) => item.id !== id))} />
    </>
  );
}
