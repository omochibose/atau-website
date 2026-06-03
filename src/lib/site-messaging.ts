/** Why / How / What — shared site copy */

export const mission = {
  title: '挑戦しやすい社会を創る',
  tagline: 'Inspire Ambition',
  lead: '皆が挑戦しやすい社会はきっと素晴らしい。ATAUは、ITの力でその挑戦を実現します。',
} as const;

export const howOffer = {
  label: 'How',
  heading: '挑戦しやすい社会を創るための3つの事業',
  lead: 'Inspire・Amplify・Empowerの3つで、自ら挑戦し、その過程を発信し、ITで他者の挑戦を支えます。',
  why:
    '生活は比較的満ち足りている一方で、挑戦するきっかけは生まれにくい——ATAUは、この「現代特有の挑戦しにくさ」に向き合うために、以下の3つの事業を掲げています。',
  visionHref: '/blog/atau_vision_eudaimonia',
  visionLinkLabel: 'なぜ「挑戦しやすい社会」を目指すのか',
  detailHref: '/blog/atau_pillars_article',
  detailLabel: '3つの柱を詳しく見る',
} as const;

export const whatByPillar = {
  label: 'What',
  heading: '各事業の柱における具体的な活動',
  lead: '3つの柱それぞれで、いま取り組んでいることと提供しているサービスをご紹介します。',
  detailHref: '/blog/atau_what_we_do',
  detailLabel: '活動一覧を詳しく見る',
} as const;

export const inspireWhat = {
  title: 'Inspire',
  subtitle: '挑戦を生み出す',
  description:
    'ATAU自身がさまざまな領域に挑戦し続ける活動です。中期的な目標としてスポーツクラブの運営・経営を掲げ、いまは代表がテニスに本気で取り組むところから始めています。既存クラブとの協業やアカデミーへの参画、イベント企画などへ段階的に広げていく予定です。',
  href: '/blog/atau_sports_club_vision',
  linkLabel: '背景を読む',
} as const;

export const amplifyWhat = {
  title: 'Amplify',
  subtitle: '挑戦を広める',
  description:
    '挑戦にまつわるストーリーを発信・拡散していく活動です。ATAUの挑戦プロセスをブログなどで公開するほか、他社・他者の挑戦にも光を当てるコンテンツを展開していきます。インタビュー記事や事例紹介、Noteなどでの発信も予定しています。',
  href: '/blog',
  linkLabel: 'ブログを見る',
} as const;

export type EmpowerServiceItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const empowerServices: readonly EmpowerServiceItem[] = [
  {
    label: '外付けIT部門（無料相談窓口）',
    href: '/blog/atau_external_it_article',
  },
  {
    label: 'Web集客支援（Web制作・運用）',
    href: '/blog/atau_branding_article',
  },
  {
    label: 'Intaview（記事執筆AI支援サービス）',
    href: 'https://intaview.app/',
    external: true,
  },
  {
    label: '業務自動化・DX導入支援',
    href: '/blog/atau_dx_article',
  },
];

export const whatOffer = {
  label: 'What',
  heading: 'ITで、現場の挑戦を後押しする',
  lead:
    'IT部門を持たない中小企業にとっての、外付けIT部門。システム開発、業務の自動化、IT相談から、小さく始めるDXまで、伴走型で対応します。',
} as const;

/** リリース済みプロダクトがある場合に WhatWeOffer で表示 */
export const showProductOfferings = false;

export const pillars = [
  {
    number: '01',
    title: 'Inspire',
    subtitle: '挑戦を生み出す',
    description:
      '会社として、そこで働く人たちとして、さまざまな領域に挑戦し続ける。ITに限らない挑戦も、その姿勢の一部である。',
    detailLabel: '具体例',
    detail:
      '代表がテニスに本気で取り組むように、メンバーもそれぞれの領域で挑戦する。そこで培う姿勢や学びが、クライアントへの伴走にも活きる。',
  },
  {
    number: '02',
    title: 'Amplify',
    subtitle: '挑戦を広める',
    description:
      '挑戦の過程を言語化し、発信する。専門性と伴走の姿勢を、契約前から伝える。',
    detailLabel: 'ITとの関わり',
    detail:
      'ブログや事例紹介を通じて、課題の見つけ方や小さな改善の積み重ねを共有する。売り込みではなく、同じ専門領域で語り合える関係を目指す。',
  },
  {
    number: '03',
    title: 'Empower',
    subtitle: '挑戦を後押しする',
    description:
      '外付けIT部門として、開発・自動化・相談・小さなDXで、現場の挑戦を支える。',
    detailLabel: 'ITとの関わり',
    detail:
      'システム開発からRPA・業務改善まで、クライアントのペースに合わせて伴走する。',
  },
] as const;

export const serviceOfferings = [
  {
    title: '外付けIT部門',
    description:
      '専門領域ごとにベンダーを探す負担なく、幅広いIT課題にワンストップで相談できる伴走型の立ち位置。',
    href: '/blog/atau_choosing_external_it_guide',
  },
  {
    title: 'システム開発',
    description:
      '自社オリジナルの業務システムやツールを、小規模から段階的に。AI支援により、従来より低コストな開発も可能。',
    href: '/blog/atau_dx_article',
  },
  {
    title: '業務の自動化',
    description:
      '既存の業務プロセスを大きく変えずに、RPAやスクリプトで負荷の高い作業を自動化。請求業務の短縮など。',
    href: '/blog/atau_external_it_article',
  },
  {
    title: 'IT相談・小さなDX',
    description:
      '「何から手をつけるべきかわからない」段階から。身近な面倒ごとを起点に、小さく試して効果を確認する。',
    href: '/blog/atau_dx_article',
  },
] as const;

export const productOfferings = [
  {
    title: 'dailyTracker',
    description: '1日の行動ログを半自動で記録・可視化し、時間の使い方を改善するためのツール（開発中）。',
    href: '/blog/atau_pillars_article',
  },
  {
    title: '自社発プロダクト',
    description:
      '投稿・記事執筆支援やデータ分析パイプラインなど、自社で使い込んだ技術を順次サービス化していきます。',
    href: '/blog/atau_branding_article',
  },
] as const;

export const consultationTopics = [
  '自社オリジナルの業務システムを開発したい',
  '日々の業務をもっとラクにしたい',
  'ITのことはよくわからないが、まず話を聞いてほしい',
  'ホームページや集客について相談したい',
] as const;
