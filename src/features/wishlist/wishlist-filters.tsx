import Link from "next/link";
import type { WishlistFilters } from "@/schemas/wishlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COPY_CONDITION_LABELS,
  WISHLIST_PRIORITY_LABELS,
} from "@/lib/labels";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30";

export function WishlistFiltersBar({
  filters,
  platforms,
  generations,
  resultCount,
}: {
  filters: WishlistFilters;
  platforms: Array<{ slug: string; name: string }>;
  generations: number[];
  resultCount: number;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-3 sm:p-4">
      <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="q">Buscar</Label>
          <Input
            id="q"
            name="q"
            defaultValue={filters.q}
            placeholder="Juego o edición"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">Prioridad</Label>
          <select
            id="priority"
            name="priority"
            className={selectClass}
            defaultValue={filters.priority ?? ""}
          >
            <option value="">Todas</option>
            {Object.entries(WISHLIST_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
          <Label htmlFor="minCondition">Condición mínima</Label>
          <select
            id="minCondition"
            name="minCondition"
            className={selectClass}
            defaultValue={filters.minCondition ?? ""}
          >
            <option value="">Todas</option>
            {Object.entries(COPY_CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort">Orden</Label>
          <select
            id="sort"
            name="sort"
            className={selectClass}
            defaultValue={filters.sort}
          >
            <option value="priority">Prioridad</option>
            <option value="updated_desc">Actualización reciente</option>
            <option value="target_price">Precio objetivo</option>
            <option value="max_price">Precio máximo</option>
            <option value="generation">Generación</option>
            <option value="name">Nombre</option>
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2">
          <label className="inline-flex h-8 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="withMaxPrice"
              value="true"
              defaultChecked={filters.withMaxPrice}
              className="size-4 rounded border-input"
            />
            Solo con precio máximo
          </label>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit" className="flex-1">
            Aplicar filtros
          </Button>
          <Link
            href="/wishlist"
            className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
          >
            Limpiar
          </Link>
        </div>
      </form>
      <p className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {resultCount} objetivos
      </p>
    </div>
  );
}
