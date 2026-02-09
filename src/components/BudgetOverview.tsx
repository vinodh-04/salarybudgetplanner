import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Receipt, Target } from 'lucide-react';
import { BudgetPlan } from '@/types/budget';

interface BudgetOverviewProps {
  budgetPlan: BudgetPlan;
}

export function BudgetOverview({ budgetPlan }: BudgetOverviewProps) {
  const { totalIncome, totalExpenses, savings, savingsGoal } = budgetPlan;
  const savingsProgress = Math.min((savings / savingsGoal) * 100, 100);
  const isOnTrack = savings >= savingsGoal;

  const stats = [
    {
      label: 'Total Income',
      value: totalIncome,
      icon: Wallet,
      color: 'bg-primary/10 text-primary',
      trend: null,
    },
    {
      label: 'Total Expenses',
      value: totalExpenses,
      icon: Receipt,
      color: 'bg-destructive/10 text-destructive',
      trend: 'down' as const,
    },
    {
      label: 'Current Savings',
      value: savings,
      icon: PiggyBank,
      color: savings > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive',
      trend: savings > 0 ? ('up' as const) : ('down' as const),
    },
    {
      label: 'Savings Goal',
      value: savingsGoal,
      icon: Target,
      color: 'bg-accent/10 text-accent-foreground',
      trend: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-card p-5 shadow-md border border-border/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-display font-bold tracking-tight">
                  ${stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            {stat.trend && (
              <div className="mt-3 flex items-center text-sm">
                {stat.trend === 'up' ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4 text-destructive" />
                )}
                <span className={stat.trend === 'up' ? 'text-primary' : 'text-destructive'}>
                  {stat.trend === 'up' ? 'On track' : 'Overspending'}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Savings Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-card p-6 shadow-md border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-semibold">Savings Progress</h3>
            <p className="text-sm text-muted-foreground">
              {isOnTrack ? "You're on track! 🎉" : `$${(savingsGoal - savings).toLocaleString()} more to reach your goal`}
            </p>
          </div>
          <span className={`text-2xl font-bold ${isOnTrack ? 'text-primary' : 'text-accent'}`}>
            {savingsProgress.toFixed(0)}%
          </span>
        </div>
        <div className="h-4 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${savingsProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${isOnTrack ? 'gradient-primary' : 'gradient-accent'}`}
          />
        </div>
        <div className="mt-3 flex justify-between text-sm text-muted-foreground">
          <span>$0</span>
          <span>${savingsGoal.toLocaleString()}</span>
        </div>
      </motion.div>
    </div>
  );
}
