import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Pencil, ShoppingBag } from "lucide-react";
import type { WishlistEntryItem } from "@/services/wishlist";
import { DeleteWishlistButton } from "@/features/wishlist/delete-wishlist-button";
import { Badge } from "@/components/ui/badge";
import { formatCentsEs, formatDateEs } from "@/lib/format";
import {
  COPY_CONDITION_LABELS,
  WISHLIST_PRIORITY_LABELS,
} from "@/lib/labels";

export function WishlistCard({ item }: { item: WishlistEntryItem }) {
  const imageSrc = item.imageUrl ?? "/placeholders/games/generic.svg";

  return (
    <article className="grid gap-3 rounded-xl border border-border/80 bg-card/60 p-3 shadow-[var(--shadow-sm)] sm:grid-cols-[88px_1fr]">
      <Link
        href={`/catalog/${item.editionSlug}`}
        className="relative aspect-[3/4] w-24 overflow-hidden rounded-lg bg-muted sm:w-full"
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="96px"
          unoptimized
        />
      </Link>
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/catalog/${item.editionSlug}`}
              className="font-medium hover:text-primary"
            >
              {item.gameName}
            </Link>
            <p className="text-sm text-muted-foreground">
              {item.editionLabel} · {item.platformName}
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">
              {WISHLIST_PRIORITY_LABELS[item.priority]}
            </Badge>
            {item.isOwnedPrimary ? (
              <Badge variant="outline">Ya en colección</Badge>
            ) : null}
          </div>
        </div>

        <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <Detail term="Generación" value={`Gen ${item.generation}`} />
          <Detail term="Región" value={item.regionName} />
          <Detail term="Idioma" value={item.language.toUpperCase()} />
          <Detail
            term="Precio objetivo"
            value={
              item.targetPriceCents === null
                ? "Sin definir"
                : formatCentsEs(item.targetPriceCents, item.currency)
            }
          />
          <Detail
            term="Precio máximo"
            value={
              item.maxPriceCents === null
                ? "Sin definir"
                : formatCentsEs(item.maxPriceCents, item.currency)
            }
          />
          <Detail
            term="Condición mínima"
            value={
              item.minCondition
                ? COPY_CONDITION_LABELS[item.minCondition]
                : "Sin mínimo"
            }
          />
        </dl>

        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Componentes: </span>
            {item.requiredComponents.length === 0
              ? "Sin componentes obligatorios"
              : item.requiredComponents.join(", ")}
          </p>
          {item.notes ? (
            <p className="text-muted-foreground">{item.notes}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Actualizado {formatDateEs(item.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/wishlist/${item.id}/edit`}
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2.5 text-[0.8rem] font-medium hover:bg-muted"
          >
            <Pencil className="size-3.5" />
            Editar
          </Link>
          <Link
            href={`/collection/new?editionId=${item.gameEditionId}&wishlistEntryId=${item.id}`}
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2.5 text-[0.8rem] font-medium hover:bg-muted"
          >
            {item.isOwnedPrimary ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <ShoppingBag className="size-3.5" />
            )}
            Marcar como comprado
          </Link>
          <DeleteWishlistButton entryId={item.id} />
        </div>
      </div>
    </article>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
