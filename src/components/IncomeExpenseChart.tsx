import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface IncomeExpenseChartProps {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
}

export function IncomeExpenseChart({ totalIncome, totalExpenses, savings }: IncomeExpenseChartProps) {
  const data = [
    { name: 'Income', amount: totalIncome, fill: 'hsl(158, 64%, 32%)' },
    { name: 'Expenses', amount: totalExpenses, fill: 'hsl(0, 72%, 51%)' },
    { name: 'Savings', amount: Math.max(0, savings), fill: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-[250px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(155 15% 88%)" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tickFormatter={(value) => `$${value}`}
            stroke="hsl(160 10% 45%)"
            fontSize={12}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="hsl(160 10% 45%)"
            fontSize={12}
            width={70}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            contentStyle={{
              backgroundColor: 'hsl(40 20% 99%)',
              border: '1px solid hsl(155 15% 88%)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Bar 
            dataKey="amount" 
            radius={[0, 8, 8, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
