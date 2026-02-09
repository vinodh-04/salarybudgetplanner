import { useState, useCallback, useMemo } from 'react';
import { Expense, Income, BudgetPlan, ExpenseCategory } from '@/types/budget';

const generateId = () => Math.random().toString(36).substring(2, 11);

const DEMO_EXPENSES: Expense[] = [
  { id: '1', category: 'housing', amount: 800, description: 'Rent', date: '2026-02-01', isRecurring: true },
  { id: '2', category: 'food', amount: 320, description: 'Groceries', date: '2026-02-05', isRecurring: false },
  { id: '3', category: 'utilities', amount: 120, description: 'Electric & Internet', date: '2026-02-03', isRecurring: true },
  { id: '4', category: 'transportation', amount: 80, description: 'Bus pass', date: '2026-02-01', isRecurring: true },
  { id: '5', category: 'entertainment', amount: 45, description: 'Streaming services', date: '2026-02-01', isRecurring: true },
  { id: '6', category: 'healthcare', amount: 50, description: 'Pharmacy', date: '2026-02-10', isRecurring: false },
  { id: '7', category: 'shopping', amount: 75, description: 'Clothes', date: '2026-02-08', isRecurring: false },
];

const DEMO_INCOME: Income[] = [
  { id: '1', source: 'Salary', amount: 2200, isRecurring: true, date: '2026-02-01' },
  { id: '2', source: 'Freelance', amount: 350, isRecurring: false, date: '2026-02-15' },
];

export function useBudget() {
  const [expenses, setExpenses] = useState<Expense[]>(DEMO_EXPENSES);
  const [income, setIncome] = useState<Income[]>(DEMO_INCOME);
  const [savingsGoal, setSavingsGoal] = useState(500);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: generateId() }]);
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const addIncome = useCallback((incomeItem: Omit<Income, 'id'>) => {
    setIncome(prev => [...prev, { ...incomeItem, id: generateId() }]);
  }, []);

  const removeIncome = useCallback((id: string) => {
    setIncome(prev => prev.filter(i => i.id !== id));
  }, []);

  const budgetPlan = useMemo((): BudgetPlan => {
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const savings = totalIncome - totalExpenses;

    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const categoryBudgets: Record<ExpenseCategory, number> = {
      housing: categoryTotals.housing || 0,
      food: categoryTotals.food || 0,
      transportation: categoryTotals.transportation || 0,
      utilities: categoryTotals.utilities || 0,
      healthcare: categoryTotals.healthcare || 0,
      entertainment: categoryTotals.entertainment || 0,
      shopping: categoryTotals.shopping || 0,
      savings: Math.max(0, savings),
      other: categoryTotals.other || 0,
    };

    const recommendations: string[] = [];
    
    if (savings < savingsGoal) {
      recommendations.push(`You're $${savingsGoal - savings} short of your savings goal. Consider reducing non-essential spending.`);
    }
    
    const entertainmentRatio = (categoryBudgets.entertainment / totalIncome) * 100;
    if (entertainmentRatio > 10) {
      recommendations.push(`Entertainment spending is ${entertainmentRatio.toFixed(1)}% of income. Try to keep it under 10%.`);
    }

    const housingRatio = (categoryBudgets.housing / totalIncome) * 100;
    if (housingRatio > 35) {
      recommendations.push(`Housing costs are ${housingRatio.toFixed(1)}% of income. The recommended max is 30-35%.`);
    }

    if (savings >= savingsGoal) {
      recommendations.push(`Great job! You're meeting your savings goal of $${savingsGoal}.`);
    }

    const predictions = Object.entries(categoryTotals).map(([category, amount]) => ({
      category: category as ExpenseCategory,
      predictedAmount: amount * 1.02, // Simple 2% inflation prediction
      trend: amount > 200 ? 'up' as const : 'stable' as const,
      alert: amount > totalIncome * 0.3 ? `High spending in ${category}` : undefined,
    }));

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsGoal,
      categoryBudgets,
      recommendations,
      predictions,
    };
  }, [expenses, income, savingsGoal]);

  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = [];
      }
      acc[expense.category].push(expense);
      return acc;
    }, {} as Record<ExpenseCategory, Expense[]>);
  }, [expenses]);

  return {
    expenses,
    income,
    savingsGoal,
    budgetPlan,
    expensesByCategory,
    addExpense,
    removeExpense,
    addIncome,
    removeIncome,
    setSavingsGoal,
  };
}
