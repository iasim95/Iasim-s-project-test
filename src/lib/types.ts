export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
};

export type ExpenseWithCategory = Expense & {
  category: Pick<Category, "id" | "name" | "color"> | null;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  created_at: string;
};

export type Income = {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  income_date: string;
  created_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  active: boolean;
  created_at: string;
};

export type RecurringExpense = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  day_of_month: number;
  active: boolean;
  last_generated_month: string | null;
  created_at: string;
};
