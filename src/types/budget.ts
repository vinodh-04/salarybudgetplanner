export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
}

export type ExpenseCategory = 
  | 'housing'
  | 'food'
  | 'transportation'
  | 'utilities'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'savings'
  | 'other';

export interface Income {
  id: string;
  source: string;
  amount: number;
  isRecurring: boolean;
  date: string;
}

export interface BudgetPlan {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsGoal: number;
  categoryBudgets: Record<ExpenseCategory, number>;
  recommendations: string[];
  predictions: SpendingPrediction[];
}

export interface SpendingPrediction {
  category: ExpenseCategory;
  predictedAmount: number;
  trend: 'up' | 'down' | 'stable';
  alert?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentType?: AgentType;
}

export type AgentType = 
  | 'data-collection'
  | 'expense-analysis'
  | 'budget-planning'
  | 'prediction'
  | 'recommendation'
  | 'interaction';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Housing',
  food: 'Food & Groceries',
  transportation: 'Transportation',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  savings: 'Savings',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: 'hsl(158, 64%, 32%)',
  food: 'hsl(38, 92%, 50%)',
  transportation: 'hsl(200, 70%, 50%)',
  utilities: 'hsl(280, 60%, 55%)',
  healthcare: 'hsl(0, 72%, 51%)',
  entertainment: 'hsl(320, 70%, 50%)',
  shopping: 'hsl(180, 60%, 45%)',
  savings: 'hsl(145, 60%, 45%)',
  other: 'hsl(220, 15%, 55%)',
};
