/** pubDate をローカル日付キー（YYYY-MM-DD）に変換 */
export function toDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

export interface ActivityPost {
  slug: string;
  title: string;
  pubDate: Date;
}

export interface ActivityDay {
  date: string;
  count: number;
  posts: ActivityPost[];
}

/** 列＝1週間、行＝月〜日（7行） */
export interface ActivityWeekColumn {
  days: (ActivityDay | null)[];
}

export interface ActivityMonthLabel {
  column: number;
  label: string;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function buildPostsByDate(
  posts: ActivityPost[],
): Map<string, ActivityPost[]> {
  const postsByDate = new Map<string, ActivityPost[]>();

  for (const post of posts) {
    const key = toDateKey(post.pubDate);
    const list = postsByDate.get(key) ?? [];
    list.push(post);
    postsByDate.set(key, list);
  }

  return postsByDate;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function createDay(
  dateObj: Date,
  postsByDate: Map<string, ActivityPost[]>,
): ActivityDay {
  const date = toDateKey(dateObj);
  const dayPosts = postsByDate.get(date) ?? [];
  return { date, count: dayPosts.length, posts: dayPosts };
}

/** 当年1/1〜12/31を GitHub 風の週列グリッドに変換 */
export function buildYearWeekGrid(
  year: number,
  postsByDate: Map<string, ActivityPost[]>,
): { weeks: ActivityWeekColumn[]; monthLabels: ActivityMonthLabel[] } {
  const yearStart = new Date(year, 0, 1);
  yearStart.setHours(0, 0, 0, 0);
  const yearEnd = new Date(year, 11, 31);
  yearEnd.setHours(0, 0, 0, 0);

  const gridStart = startOfWeekMonday(yearStart);
  const gridEnd = startOfWeekMonday(yearEnd);

  const weeks: ActivityWeekColumn[] = [];
  let weekStart = gridStart;

  while (weekStart <= gridEnd) {
    const days: (ActivityDay | null)[] = [];

    for (let row = 0; row < 7; row++) {
      const dateObj = addDays(weekStart, row);
      if (dateObj < yearStart || dateObj > yearEnd) {
        days.push(null);
      } else {
        days.push(createDay(dateObj, postsByDate));
      }
    }

    weeks.push({ days });
    weekStart = addDays(weekStart, 7);
  }

  return { weeks, monthLabels: buildMonthLabels(weeks) };
}

export function buildMonthLabels(
  weeks: ActivityWeekColumn[],
): ActivityMonthLabel[] {
  const labels: ActivityMonthLabel[] = [];
  let lastMonth = -1;

  weeks.forEach((week, column) => {
    const firstDay = week.days.find((day) => day !== null);
    if (!firstDay) return;

    const [, month] = firstDay.date.split('-').map(Number);
    if (month !== lastMonth) {
      labels.push({ column, label: `${month}月` });
      lastMonth = month;
    }
  });

  return labels;
}

/** スマホ: 今月と前月に該当する週列のみ */
export function filterWeeksForMobile(
  weeks: ActivityWeekColumn[],
  now = new Date(),
): ActivityWeekColumn[] {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  return weeks.filter((week) =>
    week.days.some((day) => {
      if (!day) return false;
      const [y, m] = day.date.split('-').map(Number);
      const monthIndex = m - 1;
      return (
        (y === currentYear && monthIndex === currentMonth) ||
        (y === prevYear && monthIndex === prevMonth)
      );
    }),
  );
}

export function buildMonthLabelsForWeeks(
  weeks: ActivityWeekColumn[],
): ActivityMonthLabel[] {
  return buildMonthLabels(weeks);
}

export function countPostsInYear(posts: ActivityPost[], year: number): number {
  return posts.filter((post) => post.pubDate.getFullYear() === year).length;
}

export function formatActivityDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function activityDayHref(day: ActivityDay): string | null {
  if (day.count === 0) return null;
  if (day.count === 1) return `/blog/${day.posts[0].slug}`;
  return `/blog/date/${day.date}`;
}

export function activityDayLabel(day: ActivityDay): string {
  const label = formatActivityDateLabel(day.date);
  if (day.count === 0) return `${label}: 投稿なし`;
  if (day.count === 1) return `${label}: ${day.posts[0].title}`;
  return `${label}: ${day.count}件の投稿`;
}

export function activityDayLevel(count: number): number {
  return Math.min(count, 3);
}

/** グリッド描画用に週列をフラットなセル配列へ（列優先: 週ごとに月〜日） */
export function flattenWeekGrid(
  weeks: ActivityWeekColumn[],
): (ActivityDay | null)[] {
  const cells: (ActivityDay | null)[] = [];
  for (const week of weeks) {
    for (const day of week.days) {
      cells.push(day);
    }
  }
  return cells;
}
