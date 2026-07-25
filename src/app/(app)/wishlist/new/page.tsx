import Link from "next/link";
import { WishlistForm } from "@/features/wishlist/wishlist-form";
import { requireUser } from "@/server/session";
import { getWishlistFormData } from "@/services/wishlist";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewWishlistEntryPage({ searchParams }: Props) {
  const user = await requireUser();
  const params = await searchParams;
  const editionId = Array.isArray(params.editionId)
    ? params.editionId[0]
    : params.editionId;
  const data = await getWishlistFormData(user.id, undefined, editionId);
  const selectedId =
    data.entry?.gameEditionId && data.editions.some((e) => e.id === data.entry?.gameEditionId)
      ? data.entry.gameEditionId
      : (data.editions[0]?.id ?? "");
  const selected = data.editions.find((edition) => edition.id === selectedId);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link href="/wishlist" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver a wishlist
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Añadir a wishlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Define prioridad, precios y componentes mínimos para tu próxima compra.
        </p>
      </div>

      {data.editions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay ediciones en el catálogo. Ejecuta el seed primero.
        </p>
      ) : (
        <WishlistForm
          mode="create"
          editions={data.editions}
          initial={{
            gameEditionId: selectedId,
            priority: data.entry?.priority ?? "MEDIUM",
            targetPriceCents: data.entry?.targetPriceCents ?? null,
            maxPriceCents: data.entry?.maxPriceCents ?? null,
            minCondition: data.entry?.minCondition ?? null,
            desiredRegion: data.entry?.desiredRegion || selected?.regionName || "",
            notes: data.entry?.notes ?? "",
            requiredComponentIds: data.entry?.requiredComponentIds ?? [],
          }}
        />
      )}
    </div>
  );
}
