import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Card className="border-border/80 shadow-[var(--shadow-sm)]">
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs uppercase tracking-wide">{label}</span>
          {icon}
        </div>
        <p
          className={cn(
            "font-[family-name:var(--font-display)] text-xl font-semibold tabular-nums sm:text-2xl",
            tone === "positive" && "text-[var(--success)]",
            tone === "negative" && "text-destructive",
          )}
        >
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
