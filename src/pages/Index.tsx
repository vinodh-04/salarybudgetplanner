import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Bot, TrendingUp, PieChart, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetOverview } from '@/components/BudgetOverview';
import { ExpenseChart } from '@/components/ExpenseChart';
import { IncomeExpenseChart } from '@/components/IncomeExpenseChart';
import { ExpenseList } from '@/components/ExpenseList';
import { AddExpenseForm } from '@/components/AddExpenseForm';
import { AddIncomeForm } from '@/components/AddIncomeForm';
import { Recommendations } from '@/components/Recommendations';
import { AIChat } from '@/components/AIChat';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { useBudget } from '@/hooks/useBudget';

interface OnboardingData {
  monthlySalary: number;
  otherIncome: number;
  emis: Array<{ id: string; name: string; amount: number }>;
  expenses: Array<{ id: string; name: string; amount: number; category: string }>;
}

const Dashboard = ({ initialData, onReset }: { initialData: OnboardingData; onReset: () => void }) => {
  const {
    expenses,
    income,
    budgetPlan,
    addExpense,
    removeExpense,
    addIncome,
  } = useBudget(initialData);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Micro-Budget Planner</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Financial Assistant</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>6 AI Agents Active</span>
              </motion.div>
              <Button variant="outline" size="sm" onClick={onReset}>
                <Settings className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Overview & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Stats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BudgetOverview budgetPlan={budgetPlan} />
            </motion.section>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-border/50 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Spending Breakdown
                    </CardTitle>
                    <CardDescription>Where your money goes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExpenseChart categoryBudgets={budgetPlan.categoryBudgets} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-border/50 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Income vs Expenses
                    </CardTitle>
                    <CardDescription>Monthly comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IncomeExpenseChart
                      totalIncome={budgetPlan.totalIncome}
                      totalExpenses={budgetPlan.totalExpenses}
                      savings={budgetPlan.savings}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Expense Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Manage Expenses</CardTitle>
                  <CardDescription>Track and categorize your spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="list">All Expenses ({expenses.length})</TabsTrigger>
                      <TabsTrigger value="add">Add Expense</TabsTrigger>
                      <TabsTrigger value="income">Add Income</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list">
                      <ExpenseList expenses={expenses} onRemove={removeExpense} />
                    </TabsContent>
                    <TabsContent value="add">
                      <AddExpenseForm onAdd={addExpense} />
                    </TabsContent>
                    <TabsContent value="income">
                      <AddIncomeForm onAdd={addIncome} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - AI Assistant & Recommendations */}
          <div className="space-y-6">
            {/* AI Chat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 shadow-md overflow-hidden">
                <CardHeader className="pb-0 gradient-primary">
                  <CardTitle className="text-lg font-display flex items-center gap-2 text-primary-foreground">
                    <Bot className="h-5 w-5" />
                    AI Budget Assistant
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Multi-agent system at your service
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <AIChat budgetPlan={budgetPlan} expenses={expenses} />
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>Personalized insights from our agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <Recommendations recommendations={budgetPlan.recommendations} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>Powered by AI Multi-Agent System • Built for smart budgeting</p>
      </footer>
    </div>
  );
};

const Index = () => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
  };

  const handleReset = () => {
    setOnboardingData(null);
  };

  if (!onboardingData) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return <Dashboard initialData={onboardingData} onReset={handleReset} />;
};

export default Index;
