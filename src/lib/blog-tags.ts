/**
 * ブログタグの URL 用セグメント（非 ASCII や記号でも安全にパス化）
 */
export function tagToPathSegment(tag: string): string {
  return encodeURIComponent(tag);
}

export function tagPageHref(tag: string): string {
  return `/blog/tag/${tagToPathSegment(tag)}`;
}

/** 公開記事からユニークなタグ一覧（ソート済み） */
export function collectUniqueTags(
  posts: { data: { tags?: string[] } }[],
): string[] {
  const set = new Set<string>();
  for (const p of posts) {
    for (const t of p.data.tags ?? []) {
      set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
}
