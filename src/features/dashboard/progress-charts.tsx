"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  GenerationProgress,
  PlatformDistribution,
} from "@/domain/stats/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  byGeneration: GenerationProgress[];
  byPlatform: PlatformDistribution[];
};

export function ProgressCharts({ byGeneration, byPlatform }: Props) {
  const generationData = byGeneration.map((item) => ({
    name: `Gen ${item.generation}`,
    conseguidos: item.owned,
    pendientes: Math.max(item.total - item.owned, 0),
    percent: item.percent,
  }));

  const platformData = byPlatform.map((item) => ({
    name: item.platformName,
    conseguidos: item.owned,
    pendientes: Math.max(item.total - item.owned, 0),
    percent: item.percent,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Progreso por generación"
        description="Ediciones conseguidas frente al total del catálogo"
        empty={generationData.length === 0}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={generationData} margin={{ left: -16, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
            <XAxis dataKey="name" tick={{ fill: "oklch(0.72 0.02 40)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "oklch(0.72 0.02 40)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.21 0.018 40)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: 8,
              }}
              labelStyle={{ color: "oklch(0.96 0.01 40)" }}
            />
            <Bar dataKey="conseguidos" stackId="a" fill="oklch(0.62 0.2 28)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pendientes" stackId="a" fill="oklch(0.35 0.02 40)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Distribución por plataforma"
        description="Cobertura de la colección por hardware"
        empty={platformData.length === 0}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={platformData} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
            <XAxis type="number" allowDecimals={false} tick={{ fill: "oklch(0.72 0.02 40)", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fill: "oklch(0.72 0.02 40)", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.21 0.018 40)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="conseguidos" stackId="a" fill="oklch(0.62 0.2 28)" />
            <Bar dataKey="pendientes" stackId="a" fill="oklch(0.35 0.02 40)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  empty,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-[var(--shadow-sm)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No hay datos suficientes para esta gráfica.
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
