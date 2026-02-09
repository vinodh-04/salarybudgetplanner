import { useState, useCallback, useMemo } from 'react';
import { Expense, Income, BudgetPlan, ExpenseCategory, SavingsGoal } from '@/types/budget';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface OnboardingData {
  monthlySalary: number;
  otherIncome: number;
  emis: Array<{ id: string; name: string; amount: number }>;
  expenses: Array<{ id: string; name: string; amount: number; category: string }>;
  goals?: Array<{ name: string; targetAmount: number; monthlyPercentage: number }>;
}

function createInitialExpenses(data?: OnboardingData): Expense[] {
  if (!data) return [];
  return [
    ...data.emis.map(emi => ({
      id: emi.id,
      category: 'other' as ExpenseCategory,
      amount: emi.amount,
      description: `EMI: ${emi.name}`,
      date: new Date().toISOString().split('T')[0],
      isRecurring: true,
    })),
    ...data.expenses.map(exp => ({
      id: exp.id,
      category: (exp.category || 'other') as ExpenseCategory,
      amount: exp.amount,
      description: exp.name,
      date: new Date().toISOString().split('T')[0],
      isRecurring: true,
    })),
  ];
}

function createInitialIncome(data?: OnboardingData): Income[] {
  if (!data) return [];
  const incomeList: Income[] = [
    {
      id: generateId(),
      source: 'Monthly Salary',
      amount: data.monthlySalary,
      isRecurring: true,
      date: new Date().toISOString().split('T')[0],
    },
  ];
  if (data.otherIncome > 0) {
    incomeList.push({
      id: generateId(),
      source: 'Other Income',
      amount: data.otherIncome,
      isRecurring: true,
      date: new Date().toISOString().split('T')[0],
    });
  }
  return incomeList;
}

export function useBudget(initialData?: OnboardingData) {
  const [expenses, setExpenses] = useState<Expense[]>(() => createInitialExpenses(initialData));
  const [income, setIncome] = useState<Income[]>(() => createInitialIncome(initialData));
  const [savingsGoal, setSavingsGoal] = useState(() => 
    initialData ? Math.round((initialData.monthlySalary + initialData.otherIncome) * 0.2) : 500
  );
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    if (!initialData?.goals) return [];
    return initialData.goals.map(g => ({
      id: generateId(),
      name: g.name,
      targetAmount: g.targetAmount,
      monthlyPercentage: g.monthlyPercentage,
      currentSaved: 0,
      createdAt: new Date().toISOString(),
    }));
  });

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
    
    // EMI-specific recommendations
    const emiExpenses = expenses.filter(e => e.description.startsWith('EMI:'));
    const totalEmis = emiExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    if (totalIncome > 0) {
      const emiRatio = (totalEmis / totalIncome) * 100;
      
      if (emiRatio > 50) {
        recommendations.push(`⚠️ Your EMI payments are ${emiRatio.toFixed(0)}% of income. Banks recommend keeping EMIs under 50% of income.`);
      } else if (emiRatio > 30) {
        recommendations.push(`💳 EMI payments take up ${emiRatio.toFixed(0)}% of your income. Consider paying off smaller loans first.`);
      }

      const entertainmentRatio = (categoryBudgets.entertainment / totalIncome) * 100;
      if (entertainmentRatio > 10) {
        recommendations.push(`Entertainment spending is ${entertainmentRatio.toFixed(1)}% of income. Try to keep it under 10%.`);
      }

      const housingRatio = (categoryBudgets.housing / totalIncome) * 100;
      if (housingRatio > 35) {
        recommendations.push(`Housing costs are ${housingRatio.toFixed(1)}% of income. The recommended max is 30-35%.`);
      }
    }

    if (savings < savingsGoal) {
      recommendations.push(`You're $${(savingsGoal - savings).toLocaleString()} short of your savings goal. Consider reducing non-essential spending.`);
    }

    if (savings >= savingsGoal && savingsGoal > 0) {
      recommendations.push(`🎉 Great job! You're meeting your savings goal of $${savingsGoal.toLocaleString()}.`);
    }

    if (savings < 0) {
      recommendations.push(`🚨 You're spending $${Math.abs(savings).toLocaleString()} more than you earn. Urgent budget review needed!`);
    }

    const predictions = Object.entries(categoryTotals).map(([category, amount]) => ({
      category: category as ExpenseCategory,
      predictedAmount: amount * 1.02,
      trend: amount > 200 ? 'up' as const : 'stable' as const,
      alert: totalIncome > 0 && amount > totalIncome * 0.3 ? `High spending in ${category}` : undefined,
    }));

    return {
      totalIncome,
      totalExpenses,
      savings,
      savingsGoal,
      categoryBudgets,
      recommendations,
      predictions,
      goals,
    };
  }, [expenses, income, savingsGoal, goals]);

  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = [];
      }
      acc[expense.category].push(expense);
      return acc;
    }, {} as Record<ExpenseCategory, Expense[]>);
  }, [expenses]);

  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'currentSaved' | 'createdAt'>) => {
    setGoals(prev => [...prev, {
      ...goal,
      id: generateId(),
      currentSaved: 0,
      createdAt: new Date().toISOString(),
    }]);
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, currentSaved: g.currentSaved + amount } : g
    ));
  }, []);

  return {
    expenses,
    income,
    savingsGoal,
    goals,
    budgetPlan,
    expensesByCategory,
    addExpense,
    removeExpense,
    addIncome,
    removeIncome,
    setSavingsGoal,
    addGoal,
    removeGoal,
    contributeToGoal,
  };
}
