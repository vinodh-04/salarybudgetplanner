import { motion } from 'framer-motion';
import { Target, Plus, Trash2, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { SavingsGoal } from '@/types/budget';
import { toast } from 'sonner';

interface SavingsGoalTrackerProps {
  goals: SavingsGoal[];
  monthlyIncome: number;
  monthlySavings: number;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'currentSaved' | 'createdAt'>) => void;
  onRemoveGoal: (id: string) => void;
  onContributeToGoal: (id: string, amount: number) => void;
}

export function SavingsGoalTracker({
  goals,
  monthlyIncome,
  monthlySavings,
  onAddGoal,
  onRemoveGoal,
  onContributeToGoal,
}: SavingsGoalTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyPercentage, setMonthlyPercentage] = useState('15');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalName.trim()) {
      toast.error('Please enter a goal name');
      return;
    }
    
    const target = parseFloat(targetAmount);
    const percentage = parseFloat(monthlyPercentage);
    
    if (isNaN(target) || target <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast.error('Please enter a valid percentage (1-100)');
      return;
    }

    onAddGoal({
      name: goalName.trim(),
      targetAmount: target,
      monthlyPercentage: percentage,
    });

    setGoalName('');
    setTargetAmount('');
    setMonthlyPercentage('15');
    setShowForm(false);
    toast.success('Goal added! Start saving towards your dream!');
  };

  const calculateTimeToGoal = (goal: SavingsGoal) => {
    const monthlyContribution = (monthlyIncome * goal.monthlyPercentage) / 100;
    const remaining = goal.targetAmount - goal.currentSaved;
    
    if (monthlyContribution <= 0 || remaining <= 0) return { months: 0, years: 0 };
    
    const months = Math.ceil(remaining / monthlyContribution);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    return { months, years, remainingMonths, monthlyContribution };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-cyan-500';
    if (percentage >= 25) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Savings Goals
            </CardTitle>
            <CardDescription>Track your financial dreams</CardDescription>
          </div>
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {showForm ? 'Cancel' : 'Add Goal'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Goal Form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-4 rounded-lg bg-secondary/50 border border-border space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="goalName">What do you want to save for?</Label>
              <Input
                id="goalName"
                placeholder="e.g., Buy a Plot, Emergency Fund, New Laptop"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyPercentage">Monthly Savings (%)</Label>
                <Input
                  id="monthlyPercentage"
                  type="number"
                  placeholder="15"
                  value={monthlyPercentage}
                  onChange={(e) => setMonthlyPercentage(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {monthlyIncome > 0 && targetAmount && monthlyPercentage && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 inline mr-1 text-primary" />
                  You'll save <span className="font-bold text-primary">${((monthlyIncome * parseFloat(monthlyPercentage || '0')) / 100).toLocaleString()}</span>/month towards this goal
                </p>
              </div>
            )}

            <Button type="submit" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </motion.form>
        )}

        {/* Goals List */}
        {goals.length === 0 && !showForm ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No savings goals yet.</p>
            <p className="text-xs">Add a goal to start tracking your dreams!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = (goal.currentSaved / goal.targetAmount) * 100;
              const timeData = calculateTimeToGoal(goal);
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="group p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                        <motion.span 
                          className="text-lg"
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 2, delay: Math.random() * 2 }}
                        >
                          🎯
                        </motion.span>
                        {goal.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.monthlyPercentage}% of income monthly
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                      onClick={() => onRemoveGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <motion.span 
                        className="font-medium"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {progress.toFixed(1)}%
                      </motion.span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-secondary overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, progress)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${progress >= 75 ? 'bg-emerald-500' : progress >= 50 ? 'bg-cyan-500' : progress >= 25 ? 'bg-amber-500' : 'bg-primary'} relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${goal.currentSaved.toLocaleString()} saved</span>
                      <span>${goal.targetAmount.toLocaleString()} goal</span>
                    </div>
                  </div>

                  {/* Time Estimate */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      className="p-3 rounded-lg bg-background/50 border border-border/30 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Monthly Contribution
                      </div>
                      <p className="font-semibold text-primary">
                        ${(timeData.monthlyContribution || 0).toLocaleString()}
                      </p>
                    </motion.div>
                    <motion.div 
                      className="p-3 rounded-lg bg-background/50 border border-border/30 transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/5"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        Time to Achieve
                      </div>
                      <p className="font-semibold text-cyan-600 dark:text-cyan-400">
                        {progress >= 100 ? (
                          <motion.span 
                            className="text-emerald-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            🎉 Achieved!
                          </motion.span>
                        ) : timeData.years && timeData.years > 0 ? (
                          `${timeData.years}y ${timeData.remainingMonths}m`
                        ) : (
                          `${timeData.months} months`
                        )}
                      </p>
                    </motion.div>
                  </div>

                  {/* Quick Contribute Button */}
                  {progress < 100 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        const contribution = timeData.monthlyContribution || 0;
                        if (contribution > 0) {
                          onContributeToGoal(goal.id, contribution);
                          toast.success(`Added $${contribution.toLocaleString()} to ${goal.name}!`);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add This Month's Contribution
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
