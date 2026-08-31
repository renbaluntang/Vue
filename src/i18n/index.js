import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      book: 'Book Online Class',
      analytics: 'Progress & Badges',
      history: 'Lesson History',
      writing: 'Writing Correction',
      pointsGroup: 'Point Management',
      points: 'Point History',
      purchase: 'Purchase Points',
      refer: 'Refer a Friend',
      profile: 'Profile',
      logout: 'Logout'
    }
  },
  ja: {
    nav: {
      dashboard: 'ダッシュボード',
      book: 'オンライン授業予約',
      analytics: '学習分析・バッジ',
      history: 'レッスン履歴',
      writing: 'ライティング添削',
      pointsGroup: 'ポイント管理',
      points: 'ポイント履歴',
      purchase: 'ポイント購入',
      refer: '友達紹介',
      profile: 'プロフィール',
      logout: 'ログアウト'
    }
  }
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

export default i18n;
