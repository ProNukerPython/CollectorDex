import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import type { CollectionFilters } from "@/schemas/owned-copy";
import { collectionFiltersToSearchParams } from "@/schemas/owned-copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUTHENTICITY_LABELS,
  COPY_CONDITION_LABELS,
} from "@/lib/labels";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30";

export function CollectionFiltersBar({
  filters,
  platforms,
  regions,
  generations,
  resultCount,
}: {
  filters: CollectionFilters;
  platforms: Array<{ slug: string; name: string }>;
  regions: Array<{ slug: string; name: string }>;
  generations: number[];
  resultCount: number;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-3 sm:p-4">
      <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="view" value={filters.view} />
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="q">Buscar</Label>
          <Input id="q" name="q" defaultValue={filters.q} placeholder="Nombre…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="generation">Generación</Label>
          <select
            id="generation"
            name="generation"
            className={selectClass}
            defaultValue={filters.generation ?? ""}
          >
            <option value="">Todas</option>
            {generations.map((generation) => (
              <option key={generation} value={generation}>
                Gen {generation}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="platform">Plataforma</Label>
          <select
            id="platform"
            name="platform"
            className={selectClass}
            defaultValue={filters.platformSlug ?? ""}
          >
            <option value="">Todas</option>
            {platforms.map((platform) => (
              <option key={platform.slug} value={platform.slug}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="region">Región</Label>
          <select
            id="region"
            name="region"
            className={selectClass}
            defaultValue={filters.regionSlug ?? ""}
          >
            <option value="">Todas</option>
            {regions.map((region) => (
              <option key={region.slug} value={region.slug}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="condition">Estado</Label>
          <select
            id="condition"
            name="condition"
            className={selectClass}
            defaultValue={filters.condition ?? ""}
          >
            <option value="">Todos</option>
            {Object.entries(COPY_CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="authenticity">Autenticidad</Label>
          <select
            id="authenticity"
            name="authenticity"
            className={selectClass}
            defaultValue={filters.authenticity ?? ""}
          >
            <option value="">Todas</option>
            {Object.entries(AUTHENTICITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="completeness">Completitud</Label>
          <select
            id="completeness"
            name="completeness"
            className={selectClass}
            defaultValue={filters.completeness ?? ""}
          >
            <option value="">Todas</option>
            <option value="complete">Completa</option>
            <option value="almost">Casi completa</option>
            <option value="partial">Parcial</option>
            <option value="game_only">Solo juego</option>
            <option value="none">Sin checklist</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="primary">Tipo de copia</Label>
          <select
            id="primary"
            name="primary"
            className={selectClass}
            defaultValue={filters.primary}
          >
            <option value="all">Todas</option>
            <option value="primary">Principales</option>
            <option value="duplicates">Duplicadas</option>
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="sort">Orden</Label>
          <select
            id="sort"
            name="sort"
            className={selectClass}
            defaultValue={filters.sort}
          >
            <option value="purchased_desc">Compra más reciente</option>
            <option value="name">Nombre</option>
            <option value="price_paid">Precio pagado</option>
            <option value="completeness">Completitud</option>
            <option value="condition">Estado</option>
            <option value="estimated_value">Valor estimado</option>
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit" className="flex-1">
            Aplicar filtros
          </Button>
          <Link
            href="/collection"
            className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
          >
            Limpiar
          </Link>
        </div>
      </form>
      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <p className="text-xs text-muted-foreground">{resultCount} copias</p>
        <div className="flex gap-1">
          <ViewLink filters={{ ...filters, view: "grid" }} active={filters.view === "grid"} icon="grid" />
          <ViewLink filters={{ ...filters, view: "list" }} active={filters.view === "list"} icon="list" />
        </div>
      </div>
    </div>
  );
}

function ViewLink({
  filters,
  active,
  icon,
}: {
  filters: CollectionFilters;
  active: boolean;
  icon: "grid" | "list";
}) {
  const href = (() => {
    const params = collectionFiltersToSearchParams(filters);
    const query = params.toString();
    return query ? `/collection?${query}` : "/collection";
  })();
  return (
    <Link
      href={href}
      aria-label={icon === "grid" ? "Vista cuadrícula" : "Vista lista"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {icon === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
    </Link>
  );
}
