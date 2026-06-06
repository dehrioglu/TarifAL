import { SocialNotification } from '../types';

export const mockNotifications: SocialNotification[] = [
  {
    id: 'notification-own-recipe-comment',
    type: 'comment',
    actorId: 'user-murat',
    targetId: 'recipe-kunefe',
    text: 'Künefe tarifine yeni bir şef yorumu geldi: “Hatay peyniri seçimi lezzeti belirler.”',
    createdAt: 'az önce',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-followed-chef-tip',
    type: 'recipe',
    actorId: 'user-murat',
    targetId: 'post-icli-kofte-anneanne',
    text: 'Takip ettiğin Şef Murat, içli köfte hamuru için yeni püf noktası paylaştı.',
    createdAt: '18 dk önce',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-new-follower',
    type: 'follow',
    actorId: 'user-balikci-efe',
    text: 'Balıkçı Efe seni takip etmeye başladı.',
    createdAt: '34 dk önce',
    isRead: false,
  },
  {
    id: 'notification-ai-pantry',
    type: 'bot',
    actorId: 'user-tarifal-bot',
    targetId: 'recipe-yogurtlu-makarna',
    text: 'Dolabındaki yoğurdu değerlendirebileceğin 3 pratik tarif hazırlandı.',
    createdAt: 'Bugün',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-cart-price-signal',
    type: 'campaign',
    actorId: 'user-tarifal-bot',
    targetId: 'recipe-sebzeli-bulgur',
    text: 'Akıllı sepetinde zeytinyağı için daha avantajlı bir marka alternatifi bulundu.',
    createdAt: '1 saat önce',
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-followed-chef-menu',
    type: 'recipe',
    actorId: 'user-ayse',
    targetId: 'recipe-kuru-fasulye',
    text: 'Takip ettiğin Ayşe’nin Mutfağı, haftalık ev yemeği menüsünü paylaştı.',
    createdAt: '2 saat önce',
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-collection-update',
    type: 'collection',
    actorId: 'user-tarifal-bot',
    targetId: 'collection-master',
    text: 'Kaydettiğin “Usta işi tarifler” koleksiyonuna 2 yeni tarif önerisi eklendi.',
    createdAt: 'Dün',
    isRead: false,
  },
  {
    id: 'notification-own-recipe-saved',
    type: 'save',
    actorId: 'user-pasta-atolyesi',
    targetId: 'recipe-kunefe',
    text: 'Künefe tarifin bugün 3 kez kaydedildi. Profilindeki etkileşim artıyor.',
    createdAt: 'Dün',
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-daily-return',
    type: 'bot',
    actorId: 'user-tarifal-bot',
    targetId: 'recipe-ton-balikli-salata',
    text: 'Bugünkü hedefin için hafif, hızlı ve sepete uygun 4 tarif seçildi.',
    createdAt: 'Bugün',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=300&auto=format&fit=crop',
  },
];
