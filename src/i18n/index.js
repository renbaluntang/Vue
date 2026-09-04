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
      logout: 'Logout',
      guide: 'How to navigate'
    },
    guide: {
      step: 'Step {n} of {total}',
      clickPrompt: 'Click the highlighted button to open it.',
      lookPrompt: 'No need to press it — hit Next to carry on.',
      next: 'Next',
      back: 'Back',
      skip: 'Skip tour',
      finish: 'Finish',
      headerTitle: 'The top bar',
      headerBody: 'Always on screen: the page you are on, your point balance — click it for the full ledger — and the EN / 日本語 switch.',
      collapseTitle: 'More room for the page',
      collapseBody: 'Folds the menu down to icons. Hover any icon to see its name, and press this again to bring the labels back.',
      talkNowTitle: 'Talk Now',
      talkNowBody: 'Starts a lesson right now with whichever instructor is free — no booking, no waiting for a slot.',
      menuTitle: 'The full menu',
      menuBody: 'The bottom bar holds your four most-used pages. Everything else lives behind this button.',
      settingsTitle: 'Settings',
      settingsBody: 'Your profile, dark mode, this tour, and how to reach us — all behind the gear.',
      items: {
        dashboard: 'Your next class, your point balance, and anything that needs attention today.',
        book: 'Search instructors by subject or time, then reserve a slot. Confirmed classes appear on your dashboard.',
        history: 'Every lesson you have taken, with the instructor’s feedback and lesson report.',
        writing: 'Send an essay or email for correction, then read the marked-up version when it comes back.',
        analytics: 'Track how your skills are progressing and see the badges you have earned.',
        pointsGroup: 'Two pages: Point History is the record of every point earned and spent, Purchase Points is where you top up.',
        refer: 'Share your invite link — you and your friend both receive points.'
              }
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
      logout: 'ログアウト',
      guide: 'サイトの使い方'
    },
    guide: {
      step: '{total} ステップ中 {n} 番目',
      clickPrompt: 'ハイライトされたボタンをクリックすると開きます。',
      lookPrompt: '押さなくて大丈夫です。「次へ」で進みます。',
      next: '次へ',
      back: '戻る',
      skip: 'スキップ',
      finish: '完了',
      headerTitle: '上部バー',
      headerBody: '常に表示されます。現在のページ名、ポイント残高（クリックで履歴を表示）、EN / 日本語 の切り替えが並んでいます。',
      collapseTitle: 'ページを広く使う',
      collapseBody: 'メニューをアイコンだけに折りたためます。アイコンにカーソルを合わせると名称が表示され、もう一度押すと元に戻ります。',
      talkNowTitle: 'Talk Now（今すぐ会話）',
      talkNowBody: '予約なしで、いま対応できる講師とすぐにレッスンを始められます。',
      menuTitle: '全メニュー',
      menuBody: '画面下部のバーにはよく使う4つのページが並んでいます。その他のページはこのボタンから開けます。',
      settingsTitle: '設定',
      settingsBody: 'プロフィール、ダークモード、このツアー、お問い合わせはすべて歯車の中にあります。',
      items: {
        dashboard: '次のレッスン、ポイント残高、今日確認すべきことをまとめて表示します。',
        book: '科目や時間帯で講師を検索し、空き枠を予約します。確定したレッスンはダッシュボードに表示されます。',
        history: '受講済みのすべてのレッスンと、講師からのフィードバックやレッスンレポートを確認できます。',
        writing: '英作文やメールを送って添削を依頼し、返ってきた添削結果を読むことができます。',
        analytics: 'スキルの伸びをグラフで確認し、獲得したバッジを見ることができます。',
        pointsGroup: '2つのページがあります。「ポイント履歴」は増減の記録、「ポイント購入」は追加購入のページです。',
        refer: '紹介リンクをシェアすると、お友達とご自身の両方にポイントが付与されます。'
              }
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
