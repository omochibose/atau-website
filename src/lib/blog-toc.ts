export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

/** 目次に載せる見出し（h2・h3）を抽出 */
export function getTocHeadings(
  headings: TocHeading[],
  minDepth = 2,
  maxDepth = 3,
): TocHeading[] {
  return headings.filter(
    (heading) => heading.depth >= minDepth && heading.depth <= maxDepth,
  );
}
