import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { ArrowRight, ArrowLeft, Wallet, CreditCard, ShoppingBag, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface OnboardingData {
  monthlySalary: number;
  otherIncome: number;
  emis: EMI[];
  expenses: OtherExpense[];
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

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
  const [step, setStep] = useState(1);
  const [monthlySalary, setMonthlySalary] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [emis, setEmis] = useState<EMI[]>([]);
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  
  // Temp states for adding new items
  const [newEmiName, setNewEmiName] = useState('');
  const [newEmiAmount, setNewEmiAmount] = useState('');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('other');

  const totalSteps = 4;

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
    });
  };

  const totalEmiAmount = emis.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = (parseFloat(monthlySalary) || 0) + (parseFloat(otherIncome) || 0);
  const remainingAfterAll = totalIncome - totalEmiAmount - totalExpenseAmount;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">Set Up Your Budget</CardTitle>
            <CardDescription>Let's understand your finances in a few simple steps</CardDescription>
            
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-primary' : s < step ? 'w-8 bg-primary/50' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Monthly Income */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Wallet className="h-4 w-4" />
                      Step 1: Your Income
                    </div>
                  </div>

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
                      <p className="text-sm text-muted-foreground">Your primary monthly income after taxes</p>
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

                  {totalIncome > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <p className="text-sm text-muted-foreground">Total Monthly Income</p>
                      <p className="text-2xl font-display font-bold text-primary">${totalIncome.toLocaleString()}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: EMIs */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground text-sm font-medium">
                      <CreditCard className="h-4 w-4" />
                      Step 2: Your EMIs / Loan Payments
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Add any loans or EMIs you pay monthly (car loan, home loan, personal loan, etc.)
                  </p>

                  {/* Add EMI Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <Input
                        placeholder="EMI Name (e.g., Car Loan)"
                        value={newEmiName}
                        onChange={(e) => setNewEmiName(e.target.value.slice(0, 50))}
                        maxLength={50}
                      />
                    </div>
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
                    <Button onClick={handleAddEmi} className="gradient-accent text-accent-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Add EMI
                    </Button>
                  </div>

                  {/* EMI List */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {emis.map((emi) => (
                      <motion.div
                        key={emi.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/30"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4 text-accent" />
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
                    <p className="text-center text-muted-foreground py-4">
                      No EMIs added yet. Skip this step if you don't have any loans.
                    </p>
                  )}

                  {totalEmiAmount > 0 && (
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total EMI Payments</p>
                          <p className="text-xl font-display font-bold text-accent-foreground">${totalEmiAmount.toLocaleString()}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Remaining Income</p>
                          <p className="text-xl font-display font-bold text-primary">${(totalIncome - totalEmiAmount).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Other Expenses */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                      <ShoppingBag className="h-4 w-4" />
                      Step 3: Monthly Expenses
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Add your regular monthly expenses like rent, utilities, groceries, subscriptions, etc.
                  </p>

                  {/* Quick category buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setNewExpenseCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          newExpenseCategory === cat.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Add Expense Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <Input
                        placeholder="Expense Name (e.g., Rent)"
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value.slice(0, 50))}
                        maxLength={50}
                      />
                    </div>
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
                    <Button onClick={handleAddExpense} className="gradient-primary text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>

                  {/* Expense List */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {expenses.map((expense) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/30"
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
                    <p className="text-center text-muted-foreground py-4">
                      No expenses added yet. Add your monthly costs to get accurate insights.
                    </p>
                  )}

                  {totalExpenseAmount > 0 && (
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Expenses</p>
                          <p className="text-xl font-display font-bold">${totalExpenseAmount.toLocaleString()}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Available After All</p>
                          <p className={`text-xl font-display font-bold ${remainingAfterAll >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            ${remainingAfterAll.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 4: Summary */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Check className="h-4 w-4" />
                      Step 4: Review & Confirm
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Income Summary */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">💰 Monthly Income</h4>
                      <p className="text-2xl font-display font-bold text-primary">${totalIncome.toLocaleString()}</p>
                      {parseFloat(otherIncome) > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Salary: ${parseFloat(monthlySalary).toLocaleString()} + Other: ${parseFloat(otherIncome).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* EMI Summary */}
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">💳 EMI Payments ({emis.length})</h4>
                      <p className="text-2xl font-display font-bold text-accent-foreground">
                        ${totalEmiAmount.toLocaleString()}
                      </p>
                      {emis.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {emis.map(e => e.name).join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Expenses Summary */}
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">🛒 Other Expenses ({expenses.length})</h4>
                      <p className="text-2xl font-display font-bold">${totalExpenseAmount.toLocaleString()}</p>
                      {expenses.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {expenses.map(e => e.name).join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Net Balance */}
                    <div className={`p-4 rounded-lg ${remainingAfterAll >= 0 ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'} border`}>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        {remainingAfterAll >= 0 ? '✨ Available for Savings' : '⚠️ Budget Deficit'}
                      </h4>
                      <p className={`text-3xl font-display font-bold ${remainingAfterAll >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        ${remainingAfterAll.toLocaleString()}
                      </p>
                      {remainingAfterAll < 0 && (
                        <p className="text-sm text-destructive mt-2">
                          You're spending more than you earn. Let's work on optimizing your budget!
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < totalSteps ? (
                <Button onClick={handleNext} className="gradient-primary text-primary-foreground">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="gradient-primary text-primary-foreground">
                  <Check className="h-4 w-4 mr-2" />
                  Start Planning
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
