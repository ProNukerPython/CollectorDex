import Link from "next/link";
import { Plus } from "lucide-react";
import { WishlistCard } from "@/features/wishlist/wishlist-card";
import { WishlistFiltersBar } from "@/features/wishlist/wishlist-filters";
import { parseWishlistFilters } from "@/schemas/wishlist";
import { requireUser } from "@/server/session";
import { listWishlistEntries } from "@/services/wishlist";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WishlistPage({ searchParams }: Props) {
  const user = await requireUser();
  const filters = parseWishlistFilters(await searchParams);
  const data = await listWishlistEntries(user.id, filters);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Wishlist
          </h1>
          <p className="text-sm text-muted-foreground">
            Objetivos de compra con prioridad, precios propios y checklist esperado.
          </p>
        </div>
        <Link
          href="/wishlist/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          Añadir objetivo
        </Link>
      </div>

      <WishlistFiltersBar
        filters={data.filters}
        platforms={data.platforms}
        generations={data.generations}
        resultCount={data.items.length}
      />

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-4 py-12 text-center">
          <p className="font-medium">No hay objetivos en la wishlist</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Añade ediciones desde el catálogo o crea un objetivo manualmente.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/catalog"
              className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Ver catálogo
            </Link>
            <Link
              href="/wishlist/new"
              className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground"
            >
              Añadir objetivo
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => (
            <WishlistCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
