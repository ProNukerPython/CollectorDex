import type { CatalogPageData } from "@/services/catalog";
import { CatalogCard } from "@/features/catalog/catalog-card";
import { CatalogFiltersBar } from "@/features/catalog/catalog-filters";

export function CatalogView({ data }: { data: CatalogPageData }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
          Catálogo
        </h1>
        <p className="text-sm text-muted-foreground">
          Ediciones físicas principales. Los precios son orientativos.
        </p>
      </div>

      <CatalogFiltersBar
        filters={data.filters}
        platforms={data.platforms}
        regions={data.regions}
        generations={data.generations}
        resultCount={data.items.length}
        totalUnfiltered={data.totalUnfiltered}
      />

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-4 py-12 text-center">
          <p className="font-medium">No hay resultados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba a limpiar filtros o cambiar la búsqueda.
          </p>
        </div>
      ) : data.filters.view === "list" ? (
        <div className="space-y-2">
          {data.items.map((item) => (
            <CatalogCard key={item.id} item={item} view="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.items.map((item) => (
            <CatalogCard key={item.id} item={item} view="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
