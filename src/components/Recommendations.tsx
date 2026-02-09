import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RecommendationsProps {
  recommendations: string[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  const getIcon = (text: string) => {
    if (text.toLowerCase().includes('great') || text.toLowerCase().includes('track')) {
      return <CheckCircle2 className="h-5 w-5 text-primary" />;
    }
    if (text.toLowerCase().includes('short') || text.toLowerCase().includes('high')) {
      return <AlertTriangle className="h-5 w-5 text-accent" />;
    }
    if (text.toLowerCase().includes('reduce') || text.toLowerCase().includes('consider')) {
      return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
    }
    return <Lightbulb className="h-5 w-5 text-accent" />;
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Add more data to get personalized recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/30"
        >
          <div className="mt-0.5">{getIcon(rec)}</div>
          <p className="text-sm text-foreground leading-relaxed">{rec}</p>
        </motion.div>
      ))}
    </div>
  );
}
