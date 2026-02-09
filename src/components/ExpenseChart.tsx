import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CATEGORY_LABELS, CATEGORY_COLORS, ExpenseCategory } from '@/types/budget';

interface ExpenseChartProps {
  categoryBudgets: Record<ExpenseCategory, number>;
}

export function ExpenseChart({ categoryBudgets }: ExpenseChartProps) {
  const data = Object.entries(categoryBudgets)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      name: CATEGORY_LABELS[category as ExpenseCategory],
      value,
      color: CATEGORY_COLORS[category as ExpenseCategory],
    }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-[300px] text-muted-foreground"
      >
        No expenses to display
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            contentStyle={{
              backgroundColor: 'hsl(220 50% 12%)',
              border: '1px solid hsl(195 100% 50% / 0.3)',
              borderRadius: '0.75rem',
              boxShadow: '0 0 20px hsl(195 100% 50% / 0.2)',
              color: '#fff',
            }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-4">
        <p className="text-sm text-muted-foreground">Total Spending</p>
        <p className="text-2xl font-display font-bold text-foreground">${total.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
