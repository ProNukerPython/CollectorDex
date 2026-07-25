import Link from "next/link";
import { notFound } from "next/navigation";
import { WishlistForm } from "@/features/wishlist/wishlist-form";
import { requireUser } from "@/server/session";
import {
  getWishlistFormData,
  WishlistServiceError,
} from "@/services/wishlist";

type Props = { params: Promise<{ id: string }> };

export default async function EditWishlistEntryPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  let data: Awaited<ReturnType<typeof getWishlistFormData>>;
  try {
    data = await getWishlistFormData(user.id, id);
  } catch (error) {
    if (error instanceof WishlistServiceError) {
      notFound();
    }
    throw error;
  }

  if (!data.entry) {
    notFound();
  }

  const selected = data.editions.find(
    (edition) => edition.id === data.entry?.gameEditionId,
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link href="/wishlist" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver a wishlist
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Editar objetivo
        </h1>
        <p className="text-sm text-muted-foreground">
          {selected?.gameName ?? "Entrada de wishlist"}
        </p>
      </div>

      <WishlistForm
        mode="edit"
        entryId={data.entry.id}
        editions={data.editions}
        initial={data.entry}
      />
    </div>
  );
}
