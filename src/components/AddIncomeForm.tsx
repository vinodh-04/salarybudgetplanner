import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Income } from '@/types/budget';

interface AddIncomeFormProps {
  onAdd: (income: Omit<Income, 'id'>) => void;
}

export function AddIncomeForm({ onAdd }: AddIncomeFormProps) {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || parseFloat(amount) <= 0) return;

    onAdd({
      source,
      amount: parseFloat(amount),
      isRecurring,
      date: new Date().toISOString().split('T')[0],
    });

    setSource('');
    setAmount('');
    setIsRecurring(true);
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
          <Label htmlFor="source">Income Source</Label>
          <Input
            id="source"
            placeholder="e.g., Salary, Freelance"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="incomeAmount">Amount ($)</Label>
          <Input
            id="incomeAmount"
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="incomeRecurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
          <Label htmlFor="incomeRecurring" className="text-sm">Monthly recurring</Label>
        </div>
        <Button type="submit" className="gradient-primary text-primary-foreground hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>
    </motion.form>
  );
}
