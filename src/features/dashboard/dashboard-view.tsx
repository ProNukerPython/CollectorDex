import Link from "next/link";
import {
  Package,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { DashboardData } from "@/services/dashboard";
import { ProgressCharts } from "@/features/dashboard/progress-charts";
import { StatCard } from "@/features/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCentsEs, formatDateEs } from "@/lib/format";
import { WISHLIST_PRIORITY_LABELS } from "@/lib/labels";

export function DashboardView({ data }: { data: DashboardData }) {
  const deltaTone =
    data.valueDeltaCents > 0
      ? "positive"
      : data.valueDeltaCents < 0
        ? "negative"
        : "default";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen de tu colección. Los precios del seed son orientativos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Completado"
          value={`${data.progressPercent}%`}
          hint={`${data.ownedCount} de ${data.totalEditions}`}
          icon={<Target className="size-4" />}
        />
        <StatCard
          label="Conseguidos"
          value={String(data.ownedCount)}
          hint={`${data.pendingCount} pendientes`}
          icon={<Package className="size-4" />}
        />
        <StatCard
          label="Invertido"
          value={formatCentsEs(data.investedCents)}
          hint="Compras registradas"
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="Valor estimado"
          value={formatCentsEs(data.estimatedValueCents)}
          hint="Orientativo"
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="Diferencia"
          value={formatCentsEs(Math.abs(data.valueDeltaCents))}
          hint={
            data.valueDeltaCents >= 0
              ? "Valor por encima de la inversión"
              : "Inversión por encima del valor"
          }
          tone={deltaTone}
          icon={
            data.valueDeltaCents >= 0 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )
          }
        />
        <StatCard
          label="Pendientes"
          value={String(data.pendingCount)}
          hint="Aún por conseguir"
          icon={<Package className="size-4" />}
        />
      </div>

      <ProgressCharts
        byGeneration={data.byGeneration}
        byPlatform={data.byPlatform}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Últimas compras</CardTitle>
            <CardDescription>Historial reciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentPurchases.length === 0 ? (
              <EmptyBlock message="Aún no hay compras registradas." />
            ) : (
              data.recentPurchases.map((purchase) => (
                <Link
                  key={purchase.id}
                  href={`/catalog/${purchase.editionSlug}`}
                  className="flex items-center justify-between gap-3 rounded-md text-sm transition-colors hover:bg-muted/50 -mx-1 px-1 py-1"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{purchase.gameName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateEs(purchase.purchasedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums">
                    {formatCentsEs(purchase.totalCents, purchase.currency)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Wishlist prioritaria</CardTitle>
            <CardDescription>Lo que más te interesa ahora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.priorityWishlist.length === 0 ? (
              <EmptyBlock message="Tu wishlist está vacía." />
            ) : (
              data.priorityWishlist.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/catalog/${entry.editionSlug}`}
                  className="flex items-center justify-between gap-3 rounded-md text-sm transition-colors hover:bg-muted/50 -mx-1 px-1 py-1"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.gameName}</p>
                    {entry.targetPriceCents !== null ? (
                      <p className="text-xs text-muted-foreground">
                        Objetivo {formatCentsEs(entry.targetPriceCents)}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {WISHLIST_PRIORITY_LABELS[entry.priority]}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}
