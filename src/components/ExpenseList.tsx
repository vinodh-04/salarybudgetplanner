import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expense, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/budget';

interface ExpenseListProps {
  expenses: Expense[];
  onRemove: (id: string) => void;
}

export function ExpenseList({ expenses, onRemove }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No expenses yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      <AnimatePresence mode="popLayout">
        {expenses.map((expense) => (
          <motion.div
            key={expense.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/30 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
              />
              <div>
                <p className="font-medium text-foreground">{expense.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{CATEGORY_LABELS[expense.category]}</span>
                  {expense.isRecurring && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <RefreshCcw className="h-3 w-3" />
                        Monthly
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display font-semibold text-lg">
                ${expense.amount.toLocaleString()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(expense.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
