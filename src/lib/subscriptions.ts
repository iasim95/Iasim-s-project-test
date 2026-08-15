export type SubscriptionCandidate = {
  key: string;
  description: string;
  categoryName: string | null;
  categoryColor: string | null;
  occurrences: number;
  averageAmount: number;
  lastDate: string;
};

type ExpenseRow = {
  amount: number;
  description: string | null;
  expense_date: string;
  category: { name: string; color: string } | null;
};

const AMOUNT_TOLERANCE = 0.15; // 15%

export function detectSubscriptions(expenses: ExpenseRow[]): SubscriptionCandidate[] {
  const groups = new Map<string, ExpenseRow[]>();

  for (const expense of expenses) {
    const normalized = expense.description?.trim().toLowerCase();
    if (!normalized) continue;
    const group = groups.get(normalized) ?? [];
    group.push(expense);
    groups.set(normalized, group);
  }

  const candidates: SubscriptionCandidate[] = [];

  for (const [key, group] of groups) {
    const distinctMonths = new Set(group.map((e) => e.expense_date.slice(0, 7)));
    if (distinctMonths.size < 2) continue;

    const amounts = group.map((e) => Number(e.amount));
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const consistent = amounts.every((a) => Math.abs(a - avg) / avg <= AMOUNT_TOLERANCE);
    if (!consistent) continue;

    const sorted = [...group].sort((a, b) => a.expense_date.localeCompare(b.expense_date));
    const last = sorted[sorted.length - 1];

    candidates.push({
      key,
      description: last.description!.trim(),
      categoryName: last.category?.name ?? null,
      categoryColor: last.category?.color ?? null,
      occurrences: group.length,
      averageAmount: avg,
      lastDate: last.expense_date,
    });
  }

  return candidates.sort((a, b) => b.averageAmount - a.averageAmount);
}
