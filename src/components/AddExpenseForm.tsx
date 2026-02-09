import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Expense, ExpenseCategory, CATEGORY_LABELS } from '@/types/budget';

interface AddExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

const categories: ExpenseCategory[] = [
  'housing', 'food', 'transportation', 'utilities', 
  'healthcare', 'entertainment', 'shopping', 'other'
];

export function AddExpenseForm({ onAdd }: AddExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || parseFloat(amount) <= 0) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      category,
      isRecurring,
      date: new Date().toISOString().split('T')[0],
    });

    setDescription('');
    setAmount('');
    setCategory('food');
    setIsRecurring(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g., Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-3 pb-1">
          <div className="flex items-center gap-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="recurring" className="text-sm">Monthly recurring</Label>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
        <Plus className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
    </motion.form>
  );
}
