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
    'ATAU自身がさまざまな領域に挑戦し続ける活動です。中期的な目標としてスポーツクラブの運営・経営を掲げ、その第一歩としていまは代表がテニスに本気で取り組むところから始めています。既存クラブとの協業やアカデミーへの参画、イベント企画などへ段階的に広げていく予定です。',
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

export type EmpowerOffering = {
  title: string;
  subtitle?: string;
  description: string;
  href: string;
  external?: boolean;
};

export const empowerOfferings: readonly EmpowerOffering[] = [
  {
    title: '外付けIT部門',
    subtitle: '無料相談窓口',
    description:
      'ITに関するかかりつけ医として、社内にIT担当がいない中小企業でも気軽に相談できる入口。開発・自動化・相談まで、幅広い課題に伴走します。',
    href: '/blog/atau_external_it_article',
  },
  {
    title: 'Web集客支援',
    subtitle: 'Web制作・運用',
    description:
      '新規サイトの制作から公開後の運用・改修まで。集客やブランディング、社内Wikiなど、Web媒体の整備を一気通貫でサポートします。',
    href: '/blog/atau_web_support_service',
  },
  {
    title: 'Intaview',
    subtitle: '記事執筆AI支援サービス',
    description:
      'インタビュー形式で話した内容をもとに記事を生成。自社の情報発信の負担を減らし、Webサイトの更新を続けやすくします。',
    href: 'https://intaview.app/',
    external: true,
  },
  {
    title: '業務自動化・DX導入支援',
    description:
      '業務フローの自動化やツール導入を、クライアントごとの課題に合わせてカスタマイズ。小さく始めて、効果を確認しながら広げます。',
    href: '/blog/atau_dx_article',
  },
];

/** WhatByPillar 用の簡易リスト（empowerOfferings から生成） */
export const empowerServices = empowerOfferings.map((item) => ({
  label: item.subtitle ? `${item.title}（${item.subtitle}）` : item.title,
  href: item.href,
  external: item.external,
}));

export const empowerOffer = {
  label: 'Empower',
  heading: 'クライアントに提供するサービス',
  lead: 'Empowerは、ATAUがクライアントの挑戦を直接支える事業です。IT部門を持たない中小企業向けに、伴走型で以下のサービスを提供しています。',
  detailHref: '/blog/atau_what_we_do',
  detailLabel: 'サービス一覧を詳しく見る',
} as const;

export const whatOffer = {
  label: 'What',
  heading: 'ITで、現場の挑戦を後押しする',
  lead:
    'IT部門を持たない中小企業にとっての、外付けIT部門。システム開発、業務の自動化、IT相談から、小さく始めるDXまで、伴走型で対応します。',
} as const;

/** @deprecated serviceOfferings — business ページは empowerOfferings を使用 */
export const serviceOfferings = empowerOfferings.map((item) => ({
  title: item.title,
  description: item.description,
  href: item.href,
}));

/** リリース済みプロダクトがある場合に WhatWeOffer で表示 */
export const showProductOfferings = false;

export const pillars = [
  {
    number: '01',
    title: 'Inspire',
    subtitle: '挑戦を生み出す',
    description:
      '現代は満ち足りている一方で、挑戦を始めるきっかけは生まれにくい。自分たちが先に一歩を踏み出し、その姿を見える化することで、「自分も始めてみよう」という触発を社会に届けます。',
  },
  {
    number: '02',
    title: 'Amplify',
    subtitle: '挑戦を広める',
    description:
      '挑戦は、周囲の理解と応援があって初めて続きやすくなる。事例やプロセスを広めることで、「自分にもできるかもしれない」というイメージを増やし、挑戦しやすい空気をつくります。',
  },
  {
    number: '03',
    title: 'Empower',
    subtitle: '挑戦を後押しする',
    description:
      '意志があっても、技術やリソースの壁で挑戦が止まってしまうことがある。培った知見でその壁を下げ、挑戦が現場で形になるよう実務面から支えます。',
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
