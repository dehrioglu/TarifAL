import { SocialNotification } from '../types';

export const mockNotifications: SocialNotification[] = [
  {
    id: 'notification-like-1',
    type: 'like',
    actorId: 'user-ayse',
    targetId: 'post-lazanya-gurme',
    text: "Ayşe'nin Mutfağı Kat Kat Lazanya tarifini beğendi.",
    createdAt: 'az önce',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-comment-1',
    type: 'comment',
    actorId: 'user-murat',
    targetId: 'post-icli-kofte-anneanne',
    text: 'Şef Murat içli köfte hamuru için yanıt bıraktı.',
    createdAt: '18 dk önce',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-follow-1',
    type: 'follow',
    actorId: 'user-balikci-efe',
    text: 'Balıkçı Efe seni takip etmeye başladı.',
    createdAt: '34 dk önce',
    isRead: false,
  },
  {
    id: 'notification-bot-1',
    type: 'bot',
    actorId: 'user-tarifal-bot',
    targetId: 'post-basket-economy-bot',
    text: 'TarifAL Bot bugün için ekonomik bakliyat sepeti önerdi.',
    createdAt: '1 saat önce',
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-campaign-1',
    type: 'campaign',
    actorId: 'user-tarifal-bot',
    text: 'Kampanyalı sepet: bulgur, nohut ve yoğurt alternatifleri yenilendi.',
    createdAt: '2 saat önce',
    isRead: true,
  },
  {
    id: 'notification-tried-1',
    type: 'tried',
    actorId: 'user-pasta-atolyesi',
    targetId: 'recipe-baklava',
    text: 'Pasta Atölyesi Ev Baklavası tarifini denedi ve 5 yıldız verdi.',
    createdAt: 'Dün',
    isRead: true,
    imageUrl:
      'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-collection-1',
    type: 'collection',
    actorId: 'user-tarifal-bot',
    targetId: 'collection-master',
    text: 'Usta işi tarifler koleksiyonun 1.5B kaydetmeyi geçti.',
    createdAt: 'Dün',
    isRead: false,
  },
  {
    id: 'notification-daily-pantry',
    type: 'bot',
    actorId: 'user-tarifal-bot',
    targetId: 'recipe-yogurtlu-makarna',
    text: 'Dolabındaki yoğurdu değerlendirebileceğin 3 pratik tarif hazır.',
    createdAt: 'Bugün',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=300&auto=format&fit=crop',
  },
  {
    id: 'notification-chef-new-recipe',
    type: 'recipe',
    actorId: 'user-murat',
    targetId: 'post-hunkar-murat',
    text: 'Takip ettiğin Şef Murat yeni bir usta işi tarif paylaştı.',
    createdAt: 'Bugün',
    isRead: false,
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop',
  },
];
