import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { 
  ArrowRight, 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  ShoppingBag, 
  Check, 
  Plus, 
  Trash2,
  Database,
  PieChart,
  Calculator,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Bot,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface EMI {
  id: string;
  name: string;
  amount: number;
}

interface OtherExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
}

interface SavingsGoalInput {
  id: string;
  name: string;
  targetAmount: number;
  monthlyPercentage: number;
}

interface OnboardingData {
  monthlySalary: number;
  otherIncome: number;
  emis: EMI[];
  expenses: OtherExpense[];
  goals: Array<{ name: string; targetAmount: number; monthlyPercentage: number }>;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

// Agent definitions with their details
const AGENTS = [
  {
    id: 1,
    name: "Data Collection Agent",
    icon: Database,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    purpose: "Meet the Data Collection Agent — it gathers and validates your financial information. Enter your monthly income sources, and this agent will organize everything for the next step.",
    inputType: "income"
  },
  {
    id: 2,
    name: "EMI Tracker Agent",
    icon: CreditCard,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    purpose: "This is the EMI Tracker Agent — it monitors all your loan commitments and recurring payments. Add your EMIs here, and this agent will pass the data to the next stage.",
    inputType: "emi"
  },
  {
    id: 3,
    name: "Expense Analysis Agent",
    icon: PieChart,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    purpose: "Introducing the Expense Analysis Agent — it categorizes and analyzes your spending patterns. Add your monthly expenses, and this agent will identify where your money goes before handing off to the next agent.",
    inputType: "expenses"
  },
  {
    id: 4,
    name: "Goal Planning Agent",
    icon: Target,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    purpose: "Here is the Goal Planning Agent — it helps you set savings goals for things you want to buy. Add your dreams like a plot, car, or emergency fund, and this agent will track how long it takes to achieve them.",
    inputType: "goals"
  },
  {
    id: 5,
    name: "Budget Planning Agent",
    icon: Calculator,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    purpose: "This is the Budget Planning Agent — it creates optimized budget allocations based on your income, expenses, and goals. Review the analysis, then this agent will serve the data to the Prediction Agent.",
    inputType: "analysis"
  },
  {
    id: 6,
    name: "Prediction Agent",
    icon: TrendingUp,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    purpose: "This is the Prediction Agent — it forecasts your future spending and savings potential based on current data. Once reviewed, this agent will hand off to the Recommendation Agent.",
    inputType: "prediction"
  },
  {
    id: 7,
    name: "Recommendation Agent",
    icon: Lightbulb,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    purpose: "Finally, the Recommendation Agent — it provides personalized tips to reduce expenses and increase income. Review these suggestions to optimize your financial health!",
    inputType: "recommendations"
  }
];

// Validation schemas
const salarySchema = z.object({
  monthlySalary: z.number().min(1, "Please enter your monthly salary").max(10000000, "Please enter a valid amount"),
  otherIncome: z.number().min(0).max(10000000, "Please enter a valid amount"),
});

const emiSchema = z.object({
  name: z.string().trim().min(1, "EMI name is required").max(50, "Name too long"),
  amount: z.number().min(1, "Amount must be greater than 0").max(10000000, "Please enter a valid amount"),
});

const expenseSchema = z.object({
  name: z.string().trim().min(1, "Expense name is required").max(50, "Name too long"),
  amount: z.number().min(1, "Amount must be greater than 0").max(10000000, "Please enter a valid amount"),
});

const generateId = () => Math.random().toString(36).substring(2, 11);

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: '🏠 Rent/Housing' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'food', label: '🍕 Food & Groceries' },
  { value: 'transportation', label: '🚗 Transportation' },
  { value: 'healthcare', label: '💊 Healthcare' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'other', label: '📦 Other' },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0); // Start at intro page (step 0)
  const [monthlySalary, setMonthlySalary] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [emis, setEmis] = useState<EMI[]>([]);
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [goals, setGoals] = useState<SavingsGoalInput[]>([]);
  
  // Temp states for adding new items
  const [newEmiName, setNewEmiName] = useState('');
  const [newEmiAmount, setNewEmiAmount] = useState('');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('other');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalPercentage, setNewGoalPercentage] = useState('15');

  const totalSteps = 7;
  const currentAgent = step > 0 ? AGENTS[step - 1] : null;
  const AgentIcon = currentAgent?.icon;

  // Calculated values
  const totalIncome = (parseFloat(monthlySalary) || 0) + (parseFloat(otherIncome) || 0);
  const totalEmiAmount = emis.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalGoalPercentage = goals.reduce((sum, g) => sum + g.monthlyPercentage, 0);
  const totalGoalContribution = (totalIncome * totalGoalPercentage) / 100;
  const totalOutflow = totalEmiAmount + totalExpenseAmount;
  const remainingAfterAll = totalIncome - totalOutflow;
  const savingsRate = totalIncome > 0 ? ((remainingAfterAll / totalIncome) * 100) : 0;
  const emiToIncomeRatio = totalIncome > 0 ? ((totalEmiAmount / totalIncome) * 100) : 0;

  // Generate analysis output based on current data
  const analysisOutput = useMemo(() => {
    switch (step) {
      case 1:
        if (totalIncome > 0) {
          return {
            status: "success",
            message: `✅ Income validated! Total monthly income: $${totalIncome.toLocaleString()}`,
            details: parseFloat(otherIncome) > 0 
              ? `Primary: $${parseFloat(monthlySalary).toLocaleString()} | Additional: $${parseFloat(otherIncome).toLocaleString()}`
              : "Single income source detected"
          };
        }
        return { status: "pending", message: "⏳ Waiting for income data...", details: "Enter your monthly salary to continue" };
      
      case 2:
        if (emis.length > 0) {
          const emiWarning = emiToIncomeRatio > 50 ? "⚠️ High EMI burden detected!" : "✅ EMI ratio is healthy";
          return {
            status: emiToIncomeRatio > 50 ? "warning" : "success",
            message: `${emiWarning} Total EMIs: $${totalEmiAmount.toLocaleString()}/month`,
            details: `EMI-to-Income Ratio: ${emiToIncomeRatio.toFixed(1)}% | ${emis.length} active loan(s)`
          };
        }
        return { status: "info", message: "ℹ️ No EMIs recorded", details: "Great! No loan commitments detected. You can skip or add any loans." };
      
      case 3:
        if (expenses.length > 0) {
          const categoryBreakdown = EXPENSE_CATEGORIES.map(cat => {
            const catTotal = expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0);
            return { ...cat, total: catTotal };
          }).filter(c => c.total > 0);
          
          return {
            status: "success",
            message: `📊 ${expenses.length} expense(s) categorized. Total: $${totalExpenseAmount.toLocaleString()}/month`,
            details: categoryBreakdown.map(c => `${c.label.split(' ')[0]} $${c.total.toLocaleString()}`).join(' | ')
          };
        }
        return { status: "pending", message: "⏳ Awaiting expense data...", details: "Add your monthly expenses for accurate analysis" };
      
      case 4:
        if (goals.length > 0) {
          const totalGoalAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
          return {
            status: totalGoalPercentage <= 50 ? "success" : "warning",
            message: `🎯 ${goals.length} goal(s) set! Monthly contribution: $${totalGoalContribution.toLocaleString()}`,
            details: `${totalGoalPercentage}% of income allocated | Total targets: $${totalGoalAmount.toLocaleString()}`
          };
        }
        return { status: "info", message: "ℹ️ No savings goals yet", details: "Add a goal to start tracking your dreams! You can skip if you prefer." };
      
      case 5:
        const healthScore = savingsRate >= 20 ? "Excellent" : savingsRate >= 10 ? "Good" : savingsRate >= 0 ? "Needs Improvement" : "Critical";
        const healthColor = savingsRate >= 20 ? "text-emerald-500" : savingsRate >= 10 ? "text-amber-500" : "text-destructive";
        return {
          status: savingsRate >= 10 ? "success" : "warning",
          message: `💰 Budget Health: ${healthScore}`,
          details: `Income: $${totalIncome.toLocaleString()} | Outflow: $${totalOutflow.toLocaleString()} | Balance: $${remainingAfterAll.toLocaleString()}`,
          healthColor
        };
      
      case 6:
        const monthlyProjection = remainingAfterAll;
        const yearlyProjection = monthlyProjection * 12;
        const emergencyFundMonths = totalExpenseAmount > 0 ? Math.floor((yearlyProjection) / totalExpenseAmount) : 0;
        return {
          status: monthlyProjection > 0 ? "success" : "warning",
          message: monthlyProjection > 0 
            ? `📈 Projected yearly savings: $${yearlyProjection.toLocaleString()}`
            : "⚠️ No savings projected with current spending",
          details: monthlyProjection > 0 
            ? `Monthly: $${monthlyProjection.toLocaleString()} | Can build ${emergencyFundMonths}+ months emergency fund in a year`
            : "Consider reducing expenses or increasing income"
        };
      
      case 7:
        const tips: string[] = [];
        if (emiToIncomeRatio > 40) tips.push("💳 Consider refinancing high-interest loans");
        if (savingsRate < 20) tips.push("🎯 Target saving at least 20% of income");
        const foodExpense = expenses.filter(e => e.category === 'food').reduce((s, e) => s + e.amount, 0);
        if (foodExpense > totalIncome * 0.15) tips.push("🍳 Meal prep to reduce food costs");
        const entertainmentExpense = expenses.filter(e => e.category === 'entertainment').reduce((s, e) => s + e.amount, 0);
        if (entertainmentExpense > totalIncome * 0.1) tips.push("🎬 Audit subscriptions for unused services");
        if (goals.length > 0) tips.push(`🏆 ${goals.length} goal(s) tracked with $${totalGoalContribution.toLocaleString()}/month allocated`);
        if (tips.length === 0) tips.push("✨ Great job! Your budget looks healthy");
        tips.push("💼 Explore side income: freelancing, tutoring, online work");
        
        return {
          status: "success",
          message: `🎯 ${tips.length} personalized recommendations ready!`,
          details: tips.slice(0, 3).join(' • ')
        };
      
      default:
        return { status: "pending", message: "Loading...", details: "" };
    }
  }, [step, totalIncome, otherIncome, monthlySalary, emis, expenses, goals, totalEmiAmount, totalExpenseAmount, emiToIncomeRatio, savingsRate, remainingAfterAll, totalOutflow, totalGoalPercentage, totalGoalContribution]);

  const handleAddEmi = () => {
    const result = emiSchema.safeParse({
      name: newEmiName,
      amount: parseFloat(newEmiAmount) || 0,
    });

    if (!result.success) {
      toast.error(result.error.errors[0]?.message || "Invalid EMI details");
      return;
    }

    setEmis([...emis, { id: generateId(), name: result.data.name, amount: result.data.amount }]);
    setNewEmiName('');
    setNewEmiAmount('');
    toast.success("EMI added!");
  };

  const handleRemoveEmi = (id: string) => {
    setEmis(emis.filter(e => e.id !== id));
  };

  const handleAddExpense = () => {
    const result = expenseSchema.safeParse({
      name: newExpenseName,
      amount: parseFloat(newExpenseAmount) || 0,
    });

    if (!result.success) {
      toast.error(result.error.errors[0]?.message || "Invalid expense details");
      return;
    }

    setExpenses([...expenses, { 
      id: generateId(), 
      name: result.data.name, 
      amount: result.data.amount,
      category: newExpenseCategory 
    }]);
    setNewExpenseName('');
    setNewExpenseAmount('');
    setNewExpenseCategory('other');
    toast.success("Expense added!");
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    
    const targetAmount = parseFloat(newGoalAmount) || 0;
    const percentage = parseFloat(newGoalPercentage) || 0;
    
    if (targetAmount <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }
    
    if (percentage <= 0 || percentage > 100) {
      toast.error("Please enter a valid percentage (1-100)");
      return;
    }

    setGoals([...goals, { 
      id: generateId(), 
      name: newGoalName.trim(), 
      targetAmount,
      monthlyPercentage: percentage 
    }]);
    setNewGoalName('');
    setNewGoalAmount('');
    setNewGoalPercentage('15');
    toast.success("Goal added!");
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleNext = () => {
    if (step === 1) {
      const result = salarySchema.safeParse({
        monthlySalary: parseFloat(monthlySalary) || 0,
        otherIncome: parseFloat(otherIncome) || 0,
      });

      if (!result.success) {
        toast.error(result.error.errors[0]?.message || "Please enter valid income details");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    const salary = parseFloat(monthlySalary) || 0;
    const other = parseFloat(otherIncome) || 0;

    if (salary <= 0) {
      toast.error("Please enter your monthly salary");
      setStep(1);
      return;
    }

    onComplete({
      monthlySalary: salary,
      otherIncome: other,
      emis,
      expenses,
      goals: goals.map(g => ({
        name: g.name,
        targetAmount: g.targetAmount,
        monthlyPercentage: g.monthlyPercentage,
      })),
    });
  };

  const renderInputSection = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-base">Monthly Salary *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="salary"
                  type="number"
                  placeholder="Enter your monthly salary"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  className="pl-7 text-lg h-12"
                  min="0"
                  max="10000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other" className="text-base">Other Income (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="other"
                  type="number"
                  placeholder="Freelance, investments, etc."
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                  className="pl-7 h-12"
                  min="0"
                  max="10000000"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="EMI Name (e.g., Car Loan)"
                value={newEmiName}
                onChange={(e) => setNewEmiName(e.target.value.slice(0, 50))}
                maxLength={50}
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newEmiAmount}
                  onChange={(e) => setNewEmiAmount(e.target.value)}
                  className="pl-7"
                  min="0"
                  max="10000000"
                />
              </div>
              <Button onClick={handleAddEmi} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add EMI
              </Button>
            </div>

            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {emis.map((emi) => (
                <motion.div
                  key={emi.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{emi.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${emi.amount.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEmi(emi.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {emis.length === 0 && (
              <p className="text-center text-muted-foreground py-2 text-sm">
                No EMIs? Great! Click Next to continue.
              </p>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setNewExpenseCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    newExpenseCategory === cat.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Expense Name (e.g., Rent)"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value.slice(0, 50))}
                maxLength={50}
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="pl-7"
                  min="0"
                  max="10000000"
                />
              </div>
              <Button onClick={handleAddExpense} className="bg-purple-500 hover:bg-purple-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>

            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {expenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label.split(' ')[0]}</span>
                    <span className="font-medium">{expense.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${expense.amount.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {expenses.length === 0 && (
              <p className="text-center text-muted-foreground py-2 text-sm">
                Add your monthly expenses for accurate insights.
              </p>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Goal Name (e.g., Buy a Plot)"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value.slice(0, 50))}
                maxLength={50}
                className="md:col-span-1"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Target Amount"
                  value={newGoalAmount}
                  onChange={(e) => setNewGoalAmount(e.target.value)}
                  className="pl-7"
                  min="1"
                />
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="15"
                  value={newGoalPercentage}
                  onChange={(e) => setNewGoalPercentage(e.target.value)}
                  min="1"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%/month</span>
              </div>
              <Button onClick={handleAddGoal} className="bg-pink-500 hover:bg-pink-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            {totalIncome > 0 && newGoalAmount && newGoalPercentage && (
              <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30 text-sm">
                <span className="text-muted-foreground">Monthly contribution: </span>
                <span className="font-bold text-pink-500">
                  ${((totalIncome * (parseFloat(newGoalPercentage) || 0)) / 100).toLocaleString()}
                </span>
                {parseFloat(newGoalAmount) > 0 && (
                  <>
                    <span className="text-muted-foreground"> • Time to achieve: </span>
                    <span className="font-bold text-pink-500">
                      {Math.ceil(parseFloat(newGoalAmount) / ((totalIncome * (parseFloat(newGoalPercentage) || 1)) / 100))} months
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {goals.map((goal) => {
                const monthlyContrib = (totalIncome * goal.monthlyPercentage) / 100;
                const monthsToGoal = monthlyContrib > 0 ? Math.ceil(goal.targetAmount / monthlyContrib) : 0;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-pink-500/10 border border-pink-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-pink-500" />
                      <div>
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ${goal.targetAmount.toLocaleString()} • {goal.monthlyPercentage}%/mo • ~{monthsToGoal}mo
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {goals.length === 0 && (
              <p className="text-center text-muted-foreground py-2 text-sm">
                No goals yet? Add your dreams like buying a plot, car, or building an emergency fund!
              </p>
            )}
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-emerald-500">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-muted-foreground">Total Outflow</p>
                <p className="text-2xl font-bold text-destructive">${totalOutflow.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Savings Rate</span>
                <span className={`font-bold ${savingsRate >= 20 ? 'text-emerald-500' : savingsRate >= 10 ? 'text-amber-500' : 'text-destructive'}`}>
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.max(0, Math.min(100, savingsRate))} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">Target: 20% or more for financial health</p>
            </div>

            {goals.length > 0 && (
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <p className="text-sm text-muted-foreground mb-1">Goal Allocation</p>
                <p className="font-bold text-pink-500">${totalGoalContribution.toLocaleString()}/month ({totalGoalPercentage}%)</p>
              </div>
            )}
          </div>
        );
      
      case 6:
        const monthlyProjection = remainingAfterAll;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className={`text-xl font-bold ${monthlyProjection >= 0 ? 'text-cyan-500' : 'text-destructive'}`}>
                  ${monthlyProjection.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                <p className="text-xs text-muted-foreground">6 Months</p>
                <p className={`text-xl font-bold ${monthlyProjection >= 0 ? 'text-cyan-500' : 'text-destructive'}`}>
                  ${(monthlyProjection * 6).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
                <p className="text-xs text-muted-foreground">1 Year</p>
                <p className={`text-xl font-bold ${monthlyProjection >= 0 ? 'text-cyan-500' : 'text-destructive'}`}>
                  ${(monthlyProjection * 12).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <h4 className="font-semibold mb-2">📊 Prediction Summary</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Emergency Fund (3 months): ${(totalExpenseAmount * 3).toLocaleString()} needed</li>
                <li>• Time to build: {totalExpenseAmount > 0 && monthlyProjection > 0 ? `~${Math.ceil((totalExpenseAmount * 3) / monthlyProjection)} months` : 'N/A'}</li>
                <li>• Yearly saving potential: ${(monthlyProjection * 12).toLocaleString()}</li>
              </ul>
            </div>
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-3">
            {emiToIncomeRatio > 40 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <p className="font-medium text-sm">Reduce Loan Burden</p>
                  <p className="text-xs text-muted-foreground">Consider refinancing high-interest loans or consolidating debt</p>
                </div>
              </div>
            )}
            
            {savingsRate < 20 && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <p className="font-medium text-sm">Increase Savings Rate</p>
                  <p className="text-xs text-muted-foreground">Target saving at least 20% of your income for long-term security</p>
                </div>
              </div>
            )}
            
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
              <span className="text-xl">🍳</span>
              <div>
                <p className="font-medium text-sm">Reduce Food Costs</p>
                <p className="text-xs text-muted-foreground">Meal prep and cooking at home can save $200-400/month</p>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
              <span className="text-xl">💼</span>
              <div>
                <p className="font-medium text-sm">Explore Side Income</p>
                <p className="text-xs text-muted-foreground">Freelancing, tutoring, or online work can boost your income</p>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-medium text-sm">Audit Subscriptions</p>
                <p className="text-xs text-muted-foreground">Cancel unused subscriptions and share family plans</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Intro page (step 0)
  if (step === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0a1628 100%)',
        }}
      >
        {/* Animated blue neon background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(0, 150, 255, 0.4) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(0, 200, 255, 0.5) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(0, 180, 255, 0.3) 0%, transparent 60%)' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center space-y-12 relative z-10"
        >
          {/* White Title with blue neon glow */}
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white"
            style={{
              textShadow: '0 0 20px rgba(0, 180, 255, 0.8), 0 0 40px rgba(0, 150, 255, 0.6), 0 0 60px rgba(0, 200, 255, 0.4), 0 0 80px rgba(0, 180, 255, 0.3)',
            }}
          >
            MINI BUDGET PLANNER
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl">WITH AGENTIC AI</span>
          </motion.h1>

          {/* Blue neon glow effect decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center gap-4"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 rounded-full"
                style={{
                  background: '#00d4ff',
                  boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 60px #0096ff',
                }}
              />
            ))}
          </motion.div>

          {/* Next Button with blue neon styling */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              onClick={() => setStep(1)}
              size="lg"
              className="text-lg px-12 py-6 h-auto font-display font-bold relative overflow-hidden group border-2"
              style={{
                background: 'transparent',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 150, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)',
                color: '#fff',
                borderColor: '#00d4ff',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </span>
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.2))',
                }}
              />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main wizard steps (step 1-7)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/50 shadow-lg overflow-hidden">
          {/* Agent Header */}
          <div className="bg-blue-500/10 border-b border-blue-500/30 p-4">
            <div className="flex items-center gap-3">
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"
              >
                {AgentIcon && <AgentIcon className="h-6 w-6 text-blue-500" />}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <h2 className="font-display font-bold text-blue-500">{currentAgent?.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {AGENTS.map((agent, idx) => (
                    <div
                      key={agent.id}
                      className={`h-2 w-2 rounded-full transition-all ${
                        idx + 1 === step 
                          ? 'bg-blue-500 scale-125' 
                          : idx + 1 < step 
                            ? 'bg-blue-500/50' 
                            : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Agent Purpose */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{currentAgent?.purpose}</p>
                  </div>
                </div>

                {/* Input Section */}
                {renderInputSection()}

                {/* Analysis Output */}
                <div className={`p-4 rounded-lg border ${
                  analysisOutput.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/30' :
                  analysisOutput.status === 'warning' ? 'bg-amber-500/5 border-amber-500/30' :
                  analysisOutput.status === 'info' ? 'bg-blue-500/5 border-blue-500/30' :
                  'bg-muted/50 border-border'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agent Analysis</span>
                  </div>
                  <p className="font-medium text-sm">{analysisOutput.message}</p>
                  {analysisOutput.details && (
                    <p className="text-xs text-muted-foreground mt-1">{analysisOutput.details}</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : step === 1 ? (
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="gradient-primary text-primary-foreground">
                  <Check className="h-4 w-4 mr-2" />
                  Launch Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
