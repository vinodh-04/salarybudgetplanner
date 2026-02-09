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
          whileHover={{ x: 4, scale: 1.01 }}
          className="group flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/30 cursor-pointer transition-all duration-300 hover:bg-secondary/50 hover:border-primary/30 hover:shadow-md"
        >
          <motion.div 
            className="mt-0.5 transition-transform duration-300 group-hover:scale-110"
            whileHover={{ rotate: 15 }}
          >
            {getIcon(rec)}
          </motion.div>
          <p className="text-sm text-foreground leading-relaxed group-hover:text-primary/90 transition-colors">{rec}</p>
          
          {/* Hover indicator */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
