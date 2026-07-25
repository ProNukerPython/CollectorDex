import Link from "next/link";
import { Plus } from "lucide-react";
import { CollectionCard } from "@/features/collection/collection-card";
import { CollectionFiltersBar } from "@/features/collection/collection-filters";
import { parseCollectionFilters } from "@/schemas/owned-copy";
import { requireUser } from "@/server/session";
import { listOwnedCopies } from "@/services/collection";
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CollectionPage({ searchParams }: Props) {
  const user = await requireUser();
  const filters = parseCollectionFilters(await searchParams);
  const data = await listOwnedCopies(user.id, filters);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Mi colección
          </h1>
          <p className="text-sm text-muted-foreground">
            Copias físicas concretas con checklist y completitud.
          </p>
        </div>
        <Link
          href="/collection/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          Añadir copia
        </Link>
      </div>

      <CollectionFiltersBar
        filters={filters}
        platforms={data.platforms}
        regions={data.regions}
        generations={data.generations}
        resultCount={data.items.length}
      />

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-4 py-12 text-center">
          <p className="font-medium">No hay copias con estos filtros</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Añade tu primera copia o limpia los filtros.
          </p>
          <Link
            href="/collection/new"
            className="mt-4 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground"
          >
            Añadir copia
          </Link>
        </div>
      ) : filters.view === "list" ? (
        <div className="space-y-2">
          {data.items.map((item) => (
            <CollectionCard key={item.id} item={item} view="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item) => (
            <CollectionCard key={item.id} item={item} view="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
