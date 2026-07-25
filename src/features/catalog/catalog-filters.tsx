import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import type { CatalogFilters } from "@/domain/catalog/types";
import { catalogFiltersToSearchParams } from "@/schemas/catalog";
import type { CatalogFacetOption } from "@/services/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  filters: CatalogFilters;
  platforms: CatalogFacetOption[];
  regions: CatalogFacetOption[];
  generations: number[];
  resultCount: number;
  totalUnfiltered: number;
};

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30";

export function CatalogFiltersBar({
  filters,
  platforms,
  regions,
  generations,
  resultCount,
  totalUnfiltered,
}: Props) {
  const gridHref = buildHref({ ...filters, view: "grid" });
  const listHref = buildHref({ ...filters, view: "list" });

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-3 shadow-[var(--shadow-sm)] sm:p-4">
      <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="view" value={filters.view} />

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="q">Buscar</Label>
          <Input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="Nombre del juego…"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generation">Generación</Label>
          <select
            id="generation"
            name="generation"
            defaultValue={filters.generation ?? ""}
            className={selectClassName}
          >
            <option value="">Todas</option>
            {generations.map((generation) => (
              <option key={generation} value={generation}>
                Generación {generation}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="platform">Plataforma</Label>
          <select
            id="platform"
            name="platform"
            defaultValue={filters.platformSlug ?? ""}
            className={selectClassName}
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
            defaultValue={filters.regionSlug ?? ""}
            className={selectClassName}
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
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
            className={selectClassName}
          >
            <option value="">Todos</option>
            <option value="owned">Conseguido</option>
            <option value="wishlist">Wishlist</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minPrice">Precio mín. (€)</Label>
          <Input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            step={1}
            defaultValue={
              filters.minPriceCents !== null
                ? String(Math.round(filters.minPriceCents / 100))
                : ""
            }
            placeholder="0"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxPrice">Precio máx. (€)</Label>
          <Input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            step={1}
            defaultValue={
              filters.maxPriceCents !== null
                ? String(Math.round(filters.maxPriceCents / 100))
                : ""
            }
            placeholder="999"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="sort">Orden</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className={selectClassName}
          >
            <option value="generation">Generación</option>
            <option value="name">Nombre</option>
            <option value="price_asc">Precio ascendente</option>
            <option value="price_desc">Precio descendente</option>
            <option value="owned_first">Conseguidos primero</option>
            <option value="pending_first">Pendientes primero</option>
          </select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit" className="flex-1">
            Aplicar filtros
          </Button>
          <Link
            href="/catalog"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
          >
            Limpiar
          </Link>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <p className="text-xs text-muted-foreground">
          Mostrando {resultCount} de {totalUnfiltered} ediciones · precios orientativos
        </p>
        <div className="flex items-center gap-1">
          <Link
            href={gridHref}
            aria-label="Vista en cuadrícula"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border",
              filters.view === "grid"
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            <LayoutGrid className="size-4" />
          </Link>
          <Link
            href={listHref}
            aria-label="Vista en lista"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border",
              filters.view === "list"
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            <List className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function buildHref(filters: CatalogFilters): string {
  const params = catalogFiltersToSearchParams(filters);
  const query = params.toString();
  return query ? `/catalog?${query}` : "/catalog";
}
