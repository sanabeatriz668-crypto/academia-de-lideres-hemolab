import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border shadow-card p-5 flex items-start justify-between"
    >
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {change && (
          <p className={`text-xs font-medium ${
            changeType === "positive" ? "text-success" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className={`rounded-xl p-3 ${gradient || "bg-primary/10"}`}>
        <Icon className={`h-5 w-5 ${gradient ? "text-primary-foreground" : "text-primary"}`} />
      </div>
    </motion.div>
  );
}
