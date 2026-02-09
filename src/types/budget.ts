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

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  monthlyPercentage: number;
  currentSaved: number;
  createdAt: string;
}

export interface BudgetPlan {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsGoal: number;
  categoryBudgets: Record<ExpenseCategory, number>;
  recommendations: string[];
  predictions: SpendingPrediction[];
  goals: SavingsGoal[];
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
  housing: '#00d4ff',      // Neon cyan
  food: '#ff6b35',         // Neon orange
  transportation: '#39ff14', // Neon green
  utilities: '#ff00ff',    // Neon magenta
  healthcare: '#ff3366',   // Neon pink
  entertainment: '#ffff00', // Neon yellow
  shopping: '#00ff88',     // Neon mint
  savings: '#7b68ee',      // Neon purple
  other: '#ffa500',        // Neon amber
};
