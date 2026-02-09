import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Bot, TrendingUp, PieChart, Settings } from 'lucide-react';
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
import { SavingsGoalTracker } from '@/components/SavingsGoalTracker';
import { useBudget } from '@/hooks/useBudget';

interface OnboardingData {
  monthlySalary: number;
  otherIncome: number;
  emis: Array<{ id: string; name: string; amount: number }>;
  expenses: Array<{ id: string; name: string; amount: number; category: string }>;
  goals?: Array<{ name: string; targetAmount: number; monthlyPercentage: number }>;
}

const Dashboard = ({ initialData, onReset }: { initialData: OnboardingData; onReset: () => void }) => {
  const {
    expenses,
    income,
    budgetPlan,
    addExpense,
    removeExpense,
    addIncome,
    addGoal,
    removeGoal,
    contributeToGoal,
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
              className="flex items-center gap-3 group cursor-pointer"
            >
               <motion.div 
                 className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                 whileHover={{ rotate: [0, -5, 5, 0] }}
                 transition={{ duration: 0.5 }}
               >
                 <DollarSign className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">Budget Planner</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Financial Assistant</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:shadow-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>7 AI Agents Active</span>
              </motion.div>
              <Button variant="outline" size="sm" onClick={onReset} className="group">
                <Settings className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
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
                whileHover={{ y: -4 }}
              >
                <Card className="group border-border/50 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/30 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                  <CardHeader className="pb-2 relative">
                    <CardTitle className="text-lg font-display flex items-center gap-2 group-hover:text-primary transition-colors">
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                        <PieChart className="h-5 w-5 text-primary" />
                      </motion.div>
                      Spending Breakdown
                    </CardTitle>
                    <CardDescription>Where your money goes</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ExpenseChart categoryBudgets={budgetPlan.categoryBudgets} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group border-border/50 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/30 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                  <CardHeader className="pb-2 relative">
                    <CardTitle className="text-lg font-display flex items-center gap-2 group-hover:text-primary transition-colors">
                      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.3 }}>
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </motion.div>
                      Income vs Expenses
                    </CardTitle>
                    <CardDescription>Monthly comparison</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
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
              whileHover={{ scale: 1.002 }}
            >
              <Card className="group border-border/50 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-display group-hover:text-primary transition-colors">Manage Expenses</CardTitle>
                  <CardDescription>Track and categorize your spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="list" className="transition-all duration-300 data-[state=active]:shadow-md">
                        All Expenses ({expenses.length})
                      </TabsTrigger>
                      <TabsTrigger value="add" className="transition-all duration-300 data-[state=active]:shadow-md">
                        Add Expense
                      </TabsTrigger>
                      <TabsTrigger value="income" className="transition-all duration-300 data-[state=active]:shadow-md">
                        Add Income
                      </TabsTrigger>
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

          {/* Right Column - AI Assistant & Goals */}
          <div className="space-y-6">
            {/* Savings Goals Tracker */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <SavingsGoalTracker
                goals={budgetPlan.goals}
                monthlyIncome={budgetPlan.totalIncome}
                monthlySavings={budgetPlan.savings}
                onAddGoal={addGoal}
                onRemoveGoal={removeGoal}
                onContributeToGoal={contributeToGoal}
              />
            </motion.div>

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

          </div>
        </div>

        {/* AI Tips Section - Bottom of Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.002 }}
          className="mt-8"
        >
          <Card className="group border-border/50 shadow-md bg-gradient-to-r from-primary/5 to-accent/5 transition-all duration-300 hover:shadow-xl hover:border-primary/30 overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-pulse pointer-events-none" />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-lg font-display flex items-center gap-2 group-hover:text-primary transition-colors">
                <motion.span 
                  className="text-xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  💡
                </motion.span>
                AI Budget Tips
              </CardTitle>
              <CardDescription>Personalized recommendations from our AI agents to improve your finances</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Recommendations recommendations={budgetPlan.recommendations} />
            </CardContent>
          </Card>
        </motion.section>
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
