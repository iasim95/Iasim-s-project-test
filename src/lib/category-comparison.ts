export type CategoryComparison = {
  categoryId: string;
  name: string;
  color: string;
  current: number;
  previous: number;
  percentChange: number | null; // null when previous was 0 (can't express as %)
};

const MIN_AMOUNT = 5; // ignore tiny amounts so the insight isn't noisy

export function computeCategoryComparisons(
  current: Map<string, number>,
  previous: Map<string, number>,
  categories: { id: string; name: string; color: string }[],
): CategoryComparison[] {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const ids = new Set([...current.keys(), ...previous.keys()]);

  const comparisons: CategoryComparison[] = [];
  for (const id of ids) {
    const cat = categoryById.get(id);
    if (!cat) continue;
    const curr = current.get(id) ?? 0;
    const prev = previous.get(id) ?? 0;
    if (curr < MIN_AMOUNT && prev < MIN_AMOUNT) continue;

    comparisons.push({
      categoryId: id,
      name: cat.name,
      color: cat.color,
      current: curr,
      previous: prev,
      percentChange: prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : null,
    });
  }

  return comparisons;
}

export function biggestIncrease(comparisons: CategoryComparison[]): CategoryComparison | null {
  const withChange = comparisons.filter((c) => c.percentChange !== null && c.percentChange > 10);
  if (withChange.length === 0) return null;
  return withChange.sort((a, b) => (b.percentChange ?? 0) - (a.percentChange ?? 0))[0];
}

export function biggestDecrease(comparisons: CategoryComparison[]): CategoryComparison | null {
  const withChange = comparisons.filter((c) => c.percentChange !== null && c.percentChange < -10);
  if (withChange.length === 0) return null;
  return withChange.sort((a, b) => (a.percentChange ?? 0) - (b.percentChange ?? 0))[0];
}
